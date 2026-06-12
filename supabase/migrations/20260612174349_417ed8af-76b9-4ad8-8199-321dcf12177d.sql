
-- Activity logs table
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  user_email TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  entity_label TEXT,
  description TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_entity ON public.activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_user ON public.activity_logs(user_id);

GRANT SELECT, INSERT ON public.activity_logs TO authenticated;
GRANT ALL ON public.activity_logs TO service_role;

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all logs"
  ON public.activity_logs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated can insert logs"
  ON public.activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Helper to get current user's email from auth.users
CREATE OR REPLACE FUNCTION public.current_user_email()
RETURNS TEXT
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM auth.users WHERE id = auth.uid()
$$;

-- Trigger function for separacoes
CREATE OR REPLACE FUNCTION public.log_separacao_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email TEXT := public.current_user_email();
  v_uid UUID := auth.uid();
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.activity_logs (user_id, user_email, action, entity_type, entity_id, entity_label, description, details)
    VALUES (v_uid, v_email, 'created', 'separacao', NEW.id, NEW.codigo_obra,
      'Pedido criado: ' || NEW.cliente,
      jsonb_build_object('cliente', NEW.cliente, 'codigo_obra', NEW.codigo_obra, 'status', NEW.status));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      INSERT INTO public.activity_logs (user_id, user_email, action, entity_type, entity_id, entity_label, description, details)
      VALUES (v_uid, v_email, 'status_changed', 'separacao', NEW.id, NEW.codigo_obra,
        'Status alterado: ' || NEW.cliente || ' (' || OLD.status || ' → ' || NEW.status || ')',
        jsonb_build_object('from', OLD.status, 'to', NEW.status, 'cliente', NEW.cliente, 'codigo_obra', NEW.codigo_obra));
    ELSE
      INSERT INTO public.activity_logs (user_id, user_email, action, entity_type, entity_id, entity_label, description, details)
      VALUES (v_uid, v_email, 'updated', 'separacao', NEW.id, NEW.codigo_obra,
        'Pedido editado: ' || NEW.cliente,
        jsonb_build_object('cliente', NEW.cliente, 'codigo_obra', NEW.codigo_obra));
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.activity_logs (user_id, user_email, action, entity_type, entity_id, entity_label, description, details)
    VALUES (v_uid, v_email, 'deleted', 'separacao', OLD.id, OLD.codigo_obra,
      'Pedido excluído: ' || OLD.cliente,
      jsonb_build_object('cliente', OLD.cliente, 'codigo_obra', OLD.codigo_obra));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_log_separacoes
AFTER INSERT OR UPDATE OR DELETE ON public.separacoes
FOR EACH ROW EXECUTE FUNCTION public.log_separacao_activity();

-- Trigger function for entregas_finalizadas
CREATE OR REPLACE FUNCTION public.log_entrega_finalizada_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email TEXT := public.current_user_email();
  v_uid UUID := auth.uid();
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.activity_logs (user_id, user_email, action, entity_type, entity_id, entity_label, description, details)
    VALUES (v_uid, v_email, 'delivered', 'entrega', NEW.id, NEW.codigo_obra,
      'Entrega finalizada: ' || NEW.cliente || ' (recebido por ' || COALESCE(NEW.recebido_por, '-') || ')',
      jsonb_build_object('cliente', NEW.cliente, 'codigo_obra', NEW.codigo_obra, 'recebido_por', NEW.recebido_por, 'numero_entrega', NEW.numero_entrega));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.activity_logs (user_id, user_email, action, entity_type, entity_id, entity_label, description, details)
    VALUES (v_uid, v_email, 'reverted', 'entrega', OLD.id, OLD.codigo_obra,
      'Entrega revertida: ' || OLD.cliente,
      jsonb_build_object('cliente', OLD.cliente, 'codigo_obra', OLD.codigo_obra));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_log_entregas_finalizadas
AFTER INSERT OR DELETE ON public.entregas_finalizadas
FOR EACH ROW EXECUTE FUNCTION public.log_entrega_finalizada_activity();

-- Trigger function for entregas_pendentes
CREATE OR REPLACE FUNCTION public.log_entrega_pendente_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email TEXT := public.current_user_email();
  v_uid UUID := auth.uid();
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.activity_logs (user_id, user_email, action, entity_type, entity_id, entity_label, description, details)
    VALUES (v_uid, v_email, 'pendency_created', 'pendencia', NEW.id, NEW.codigo_obra,
      'Pendência registrada: ' || NEW.cliente || ' - ' || NEW.tipo_problema,
      jsonb_build_object('cliente', NEW.cliente, 'tipo_problema', NEW.tipo_problema));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status_pendencia IS DISTINCT FROM OLD.status_pendencia THEN
      INSERT INTO public.activity_logs (user_id, user_email, action, entity_type, entity_id, entity_label, description, details)
      VALUES (v_uid, v_email, 'pendency_status_changed', 'pendencia', NEW.id, NEW.codigo_obra,
        'Pendência atualizada: ' || NEW.cliente || ' (' || COALESCE(OLD.status_pendencia,'-') || ' → ' || COALESCE(NEW.status_pendencia,'-') || ')',
        jsonb_build_object('from', OLD.status_pendencia, 'to', NEW.status_pendencia, 'cliente', NEW.cliente));
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_log_entregas_pendentes
AFTER INSERT OR UPDATE ON public.entregas_pendentes
FOR EACH ROW EXECUTE FUNCTION public.log_entrega_pendente_activity();
