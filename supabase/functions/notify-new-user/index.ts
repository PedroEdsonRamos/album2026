import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await req.json();

    // O webhook do Supabase envia os dados do novo usuário
    const record = payload.record;
    const userId   = record?.id;
    const userEmail = record?.email ?? "Email não disponível";
    const userName  = record?.display_name ?? "Nome não informado";
    const createdAt = new Date().toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
      dateStyle: "short",
      timeStyle: "short",
    });

    // Envia email de notificação para você via Resend
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) throw new Error("RESEND_API_KEY não configurada");

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev",
        // ← SUBSTITUA pelo seu email pessoal (o mesmo da conta Resend)
        to: ["pedroerv22@gmail.com"],
        subject: `🏆 Novo cadastro aguardando aprovação — ${userName}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#0c0c1a;color:#fff;padding:32px;border-radius:12px">
            <div style="text-align:center;margin-bottom:24px">
              <div style="font-size:32px;margin-bottom:8px">🏆</div>
              <div style="color:#f59e0b;font-size:16px;font-weight:bold">FIFA WORLD CUP 2026</div>
              <div style="color:rgba(255,255,255,0.4);font-size:11px;letter-spacing:0.1em;text-transform:uppercase">
                COLEÇÃO VIRTUAL · ADMIN
              </div>
            </div>

            <div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:20px;margin-bottom:20px">
              <div style="font-size:16px;font-weight:bold;color:#fff;margin-bottom:16px">
                👤 Novo usuário aguardando aprovação
              </div>
              <table style="width:100%;border-collapse:collapse">
                <tr>
                  <td style="padding:6px 0;font-size:12px;color:rgba(255,255,255,0.4);width:80px">Nome</td>
                  <td style="padding:6px 0;font-size:13px;color:#fff;font-weight:600">${userName}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:12px;color:rgba(255,255,255,0.4)">Email</td>
                  <td style="padding:6px 0;font-size:13px;color:#f59e0b">${userEmail}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:12px;color:rgba(255,255,255,0.4)">Horário</td>
                  <td style="padding:6px 0;font-size:13px;color:rgba(255,255,255,0.6)">${createdAt}</td>
                </tr>
              </table>
            </div>

            <div style="text-align:center;margin:24px 0">
              <a href="https://supabase.com/dashboard/project/hvwqikyhnbehcebejbsz/editor"
                 style="display:inline-block;background:#f59e0b;color:#000;font-weight:bold;font-size:14px;padding:12px 28px;border-radius:10px;text-decoration:none">
                ✅ Aprovar no Supabase
              </a>
            </div>

            <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:14px">
              <div style="font-size:11px;color:rgba(255,255,255,0.35);margin-bottom:8px;text-transform:uppercase;letter-spacing:0.08em">
                Como aprovar
              </div>
              <div style="font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7">
                1. Clique no botão acima ou acesse o Supabase<br/>
                2. Vá em Table Editor → user_profiles<br/>
                3. Encontre o usuário e mude approved para TRUE<br/>
                <br/>
                Ou execute no SQL Editor:<br/>
                <code style="background:rgba(255,255,255,0.08);padding:4px 8px;border-radius:4px;font-size:11px;color:#f59e0b">
                  UPDATE user_profiles SET approved = TRUE WHERE id = (SELECT id FROM auth.users WHERE email = '${userEmail}');
                </code>
              </div>
            </div>

            <div style="text-align:center;margin-top:24px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.08)">
              <img src="https://fifa-world-cup-2026-virtual-collection.vercel.app/PTEC_Solutions_logo_VECTOR.svg"
                   alt="PTEC Solutions"
                   style="height:40px;opacity:0.4" />
              <div style="font-size:10px;color:rgba(255,255,255,0.2);margin-top:6px">
                © 2026 PTEC SOLUTIONS · DIREITOS RESERVADOS
              </div>
            </div>
          </div>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const err = await emailResponse.text();
      console.error("[notify-new-user] Resend error:", err);
      return new Response(JSON.stringify({ error: err }), { status: 500 });
    }

    console.log("[notify-new-user] Email enviado com sucesso para admin");
    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (e) {
    console.error("[notify-new-user] Erro:", e.message);
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
});