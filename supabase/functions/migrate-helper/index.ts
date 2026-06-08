Deno.serve(async (req) => {
  return new Response(JSON.stringify({ message: "migrate-helper" }), {
    headers: { "Content-Type": "application/json" },
  })
})
