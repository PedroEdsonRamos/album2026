import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    const payload = await req.json();
    const record = payload.record;
    const oldRecord = payload.old_record;

    // Só dispara quando approved muda de false para true
    if (record?.approved !== true || oldRecord?.approved === true) {
      return new Response(JSON.stringify({ skipped: true }), { status: 200 });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(record.id);
    const userEmail = userData?.user?.email;
    const userName = record.display_name ?? "Colecionador";
    if (!userEmail) throw new Error("Email não encontrado");

    const resendKey = Deno.env.get("RESEND_API_KEY");
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev",
        to: [userEmail],
        subject: "🎉 Acesso liberado! — FIFA World Cup 2026",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#0c0c1a">
            <div style="background:#0c0c1a;padding:32px;text-align:center">
              <img src="https://fifa-world-cup-2026-virtual-collection.vercel.app/trophy_title.png" style="height:72px;margin:0 auto 14px;display:block" />
              <div style="color:#f59e0b;font-size:17px;font-weight:bold;letter-spacing:0.06em">FIFA WORLD CUP 2026</div>
              <div style="color:rgba(255,255,255,0.38);font-size:10px;letter-spacing:0.14em;text-transform:uppercase;margin-top:5px">COLEÇÃO VIRTUAL</div>
            </div>
            <div style="background:#0c0c1a;padding:0 32px 32px;text-align:center">
              <div style="font-size:48px;margin:8px 0 16px">🎉</div>
              <div style="font-size:20px;font-weight:bold;color:#f59e0b;margin-bottom:8px">Acesso liberado!</div>
              <p style="font-size:14px;color:rgba(255,255,255,0.6);line-height:1.7;margin-bottom:24px">
                Olá, ${userName}!<br/>Sua conta foi aprovada. Agora você já pode montar sua coleção.
              </p>
              <a href="https://fifa-world-cup-2026-virtual-collection.vercel.app"
                 style="display:inline-block;background:#f59e0b;color:#000;font-weight:bold;font-size:15px;padding:14px 36px;border-radius:12px;text-decoration:none">
                🏆 Acessar o álbum
              </a>
            </div>
            <div style="background:#0c0c1a;padding:20px 32px;text-align:center;border-top:1px solid rgba(255,255,255,0.08);position:relative">
              <div style="display:flex;flex-direction:column;align-items:center;padding:10px 80px 10px 0;gap:4px">
                <div style="font-size:8.5px;color:rgba(255,255,255,0.3);letter-spacing:0.1em;text-transform:uppercase">DESENVOLVIDO POR</div>
                <div style="font-size:8.5px;color:rgba(255,255,255,0.3);letter-spacing:0.06em;text-transform:uppercase">© 2026 PTEC SOLUTIONS · DIREITOS RESERVADOS</div>
              </div>
              <img src="https://fifa-world-cup-2026-virtual-collection.vercel.app/PTEC_Solutions_logo_VECTOR.svg" style="position:absolute;right:14px;top:50%;transform:translateY(-51%);height:58px;opacity:0.55" />
            </div>
          </div>
        `,
      }),
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (e) {
    console.error("[notify-user-approved]", e.message);
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
});
