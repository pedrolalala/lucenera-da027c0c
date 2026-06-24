import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const URL_ = Deno.env.get("SUPABASE_URL")!;
const KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const sb = createClient(URL_, KEY);

async function listAll(bucket: string, prefix = ""): Promise<string[]> {
  const out: string[] = [];
  let offset = 0;
  while (true) {
    const { data, error } = await sb.storage.from(bucket).list(prefix, {
      limit: 1000, offset, sortBy: { column: "name", order: "asc" },
    });
    if (error) throw error;
    if (!data || data.length === 0) break;
    for (const it of data) {
      const full = prefix ? `${prefix}/${it.name}` : it.name;
      if ((it as any).id === null || (it as any).id === undefined) {
        out.push(...await listAll(bucket, full));
      } else {
        out.push(full);
      }
    }
    if (data.length < 1000) break;
    offset += 1000;
  }
  return out;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action") ?? "list";
    const bucket = url.searchParams.get("bucket")!;
    if (action === "list") {
      const files = await listAll(bucket);
      return new Response(JSON.stringify({ files }), {
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }
    if (action === "get") {
      const path = url.searchParams.get("path")!;
      const { data, error } = await sb.storage.from(bucket).download(path);
      if (error) throw error;
      return new Response(data, { headers: { ...cors, "Content-Type": "application/octet-stream" } });
    }
    if (action === "users") {
      const all: any[] = [];
      let page = 1;
      while (true) {
        const { data, error } = await sb.auth.admin.listUsers({ page, perPage: 1000 });
        if (error) throw error;
        all.push(...data.users);
        if (data.users.length < 1000) break;
        page++;
      }
      return new Response(JSON.stringify(all), { headers: { ...cors, "Content-Type": "application/json" } });
    }
    return new Response("bad action", { status: 400, headers: cors });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
Deno.serve(async (req) => {
  return new Response(JSON.stringify({ message: "migrate-helper" }), {
    headers: { "Content-Type": "application/json" },
  })
})
