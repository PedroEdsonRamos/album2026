import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://fifa-world-cup-2026-virtual-collection.vercel.app",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const TEMPLATES = {
  team: (userName: string, teamName: string, flag: string) => ({
    subject: `${flag} Seleção completa! ${teamName} — FIFA World Cup 2026`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#0c0c1a">
        <div style="background:#0c0c1a;padding:32px;text-align:center">
          <img src="https://fifa-world-cup-2026-virtual-collection.vercel.app/trophy_title.png"
               alt="Troféu" style="height:72px;display:block;margin:0 auto 14px;object-fit:contain" />
          <div style="color:#f59e0b;font-size:17px;font-weight:bold;letter-spacing:0.06em">FIFA WORLD CUP 2026</div>
          <div style="color:rgba(255,255,255,0.38);font-size:10px;letter-spacing:0.14em;text-transform:uppercase;margin-top:5px">COLEÇÃO VIRTUAL</div>
        </div>
        <div style="background:#0c0c1a;padding:0 32px 32px">
          <div style="text-align:center;margin-bottom:24px">
            <div style="font-size:64px;margin-bottom:8px">${flag}</div>
            <div style="font-size:22px;font-weight:bold;color:#f59e0b;margin-bottom:4px">Seleção Completa! 🎉</div>
            <div style="font-size:14px;color:rgba(255,255,255,0.5)">Parabéns, ${userName}!</div>
          </div>
          <div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);border-radius:12px;padding:20px;text-align:center;margin-bottom:24px">
            <div style="font-size:16px;font-weight:bold;color:#fff;margin-bottom:6px">${teamName}</div>
            <div style="font-size:13px;color:rgba(255,255,255,0.5)">Você completou todas as figurinhas desta seleção!</div>
          </div>
          <div style="text-align:center;margin:24px 0">
            <a href="https://fifa-world-cup-2026-virtual-collection.vercel.app"
               style="display:inline-block;background:#f59e0b;color:#000;font-weight:bold;font-size:14px;padding:12px 28px;border-radius:10px;text-decoration:none">
              🏆 Ver minha coleção
            </a>
          </div>
          <p style="font-size:11px;color:rgba(255,255,255,0.2);text-align:center;margin:0">
            Continue coletando — o álbum completo te espera!
          </p>
        </div>
        <div style="background:#0c0c1a;padding:20px 32px;text-align:center;border-top:1px solid rgba(255,255,255,0.08);position:relative">
          <div style="display:flex;flex-direction:column;align-items:center;padding:10px 80px 10px 0;gap:4px">
            <div style="font-size:8.5px;color:rgba(255,255,255,0.3);letter-spacing:0.1em;text-transform:uppercase;line-height:1;white-space:nowrap">DESENVOLVIDO POR</div>
            <div style="font-size:8.5px;color:rgba(255,255,255,0.3);letter-spacing:0.06em;text-transform:uppercase;line-height:1;white-space:nowrap">© 2026 PTEC SOLUTIONS · DIREITOS RESERVADOS</div>
          </div>
          <img src="https://fifa-world-cup-2026-virtual-collection.vercel.app/PTEC_Solutions_logo_VECTOR.svg"
               alt="PTEC Solutions" style="position:absolute;right:14px;top:50%;transform:translateY(-51%);height:58px;opacity:0.55" />
        </div>
      </div>
    `,
  }),

  group: (userName: string, group: string) => ({
    subject: `🏆 Grupo ${group} completo! — FIFA World Cup 2026`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#0c0c1a">
        <div style="background:#0c0c1a;padding:32px;text-align:center">
          <img src="https://fifa-world-cup-2026-virtual-collection.vercel.app/trophy_title.png"
               alt="Troféu" style="height:72px;display:block;margin:0 auto 14px;object-fit:contain" />
          <div style="color:#f59e0b;font-size:17px;font-weight:bold;letter-spacing:0.06em">FIFA WORLD CUP 2026</div>
          <div style="color:rgba(255,255,255,0.38);font-size:10px;letter-spacing:0.14em;text-transform:uppercase;margin-top:5px">COLEÇÃO VIRTUAL</div>
        </div>
        <div style="background:#0c0c1a;padding:0 32px 32px">
          <div style="text-align:center;margin-bottom:24px">
            <div style="font-size:56px;margin-bottom:8px">🏅</div>
            <div style="font-size:22px;font-weight:bold;color:#a855f7;margin-bottom:4px">Grupo Completo! 🎊</div>
            <div style="font-size:14px;color:rgba(255,255,255,0.5)">Incrível, ${userName}!</div>
          </div>
          <div style="background:rgba(168,85,247,0.08);border:1px solid rgba(168,85,247,0.25);border-radius:12px;padding:20px;text-align:center;margin-bottom:24px">
            <div style="font-size:20px;font-weight:bold;color:#fff;margin-bottom:6px">Grupo ${group}</div>
            <div style="font-size:13px;color:rgba(255,255,255,0.5)">Você completou todas as figurinhas de todas as seleções deste grupo!</div>
          </div>
          <div style="text-align:center;margin:24px 0">
            <a href="https://fifa-world-cup-2026-virtual-collection.vercel.app"
               style="display:inline-block;background:#a855f7;color:#fff;font-weight:bold;font-size:14px;padding:12px 28px;border-radius:10px;text-decoration:none">
              🏆 Ver minha coleção
            </a>
          </div>
        </div>
        <div style="background:#0c0c1a;padding:20px 32px;text-align:center;border-top:1px solid rgba(255,255,255,0.08);position:relative">
          <div style="display:flex;flex-direction:column;align-items:center;padding:10px 80px 10px 0;gap:4px">
            <div style="font-size:8.5px;color:rgba(255,255,255,0.3);letter-spacing:0.1em;text-transform:uppercase;line-height:1;white-space:nowrap">DESENVOLVIDO POR</div>
            <div style="font-size:8.5px;color:rgba(255,255,255,0.3);letter-spacing:0.06em;text-transform:uppercase;line-height:1;white-space:nowrap">© 2026 PTEC SOLUTIONS · DIREITOS RESERVADOS</div>
          </div>
          <img src="https://fifa-world-cup-2026-virtual-collection.vercel.app/PTEC_Solutions_logo_VECTOR.svg"
               alt="PTEC Solutions" style="position:absolute;right:14px;top:50%;transform:translateY(-51%);height:58px;opacity:0.55" />
        </div>
      </div>
    `,
  }),

  album: (userName: string) => ({
    subject: `🏆 ÁLBUM COMPLETO! Parabéns! — FIFA World Cup 2026`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#0c0c1a">
        <div style="background:linear-gradient(135deg,#1a1000,#0c0c1a);padding:40px 32px;text-align:center">
          <img src="https://fifa-world-cup-2026-virtual-collection.vercel.app/trophy_title.png"
               alt="Troféu" style="height:96px;display:block;margin:0 auto 16px;object-fit:contain" />
          <div style="color:#f59e0b;font-size:20px;font-weight:bold;letter-spacing:0.06em">FIFA WORLD CUP 2026</div>
          <div style="color:rgba(255,255,255,0.38);font-size:10px;letter-spacing:0.14em;text-transform:uppercase;margin-top:5px">COLEÇÃO VIRTUAL</div>
        </div>
        <div style="background:#0c0c1a;padding:0 32px 32px">
          <div style="text-align:center;margin-bottom:28px;padding-top:8px">
            <div style="font-size:24px;font-weight:bold;color:#f59e0b;margin-bottom:8px">🏆 ÁLBUM COMPLETO! 🏆</div>
            <div style="font-size:16px;color:rgba(255,255,255,0.7);line-height:1.6">
              ${userName}, você conseguiu!<br/>
              <strong style="color:#fff">994 de 994 figurinhas coletadas!</strong>
            </div>
          </div>
          <div style="background:linear-gradient(135deg,rgba(245,158,11,0.12),rgba(168,85,247,0.12));border:1px solid rgba(245,158,11,0.3);border-radius:16px;padding:24px;text-align:center;margin-bottom:24px">
            <div style="font-size:48px;margin-bottom:12px">🎖️</div>
            <div style="font-size:15px;color:rgba(255,255,255,0.6);line-height:1.7">
              Você é um dos poucos colecionadores a completar o álbum oficial da FIFA World Cup 2026.<br/>
              Uma conquista e tanto!
            </div>
          </div>
          <div style="text-align:center;margin:28px 0">
            <a href="https://fifa-world-cup-2026-virtual-collection.vercel.app"
               style="display:inline-block;background:linear-gradient(135deg,#f59e0b,#fbbf24);color:#000;font-weight:bold;font-size:15px;padding:14px 36px;border-radius:12px;text-decoration:none">
              🏆 Ver meu álbum completo
            </a>
          </div>
        </div>
        <div style="background:#0c0c1a;padding:20px 32px;text-align:center;border-top:1px solid rgba(255,255,255,0.08);position:relative">
          <div style="display:flex;flex-direction:column;align-items:center;padding:10px 80px 10px 0;gap:4px">
            <div style="font-size:8.5px;color:rgba(255,255,255,0.3);letter-spacing:0.1em;text-transform:uppercase;line-height:1;white-space:nowrap">DESENVOLVIDO POR</div>
            <div style="font-size:8.5px;color:rgba(255,255,255,0.3);letter-spacing:0.06em;text-transform:uppercase;line-height:1;white-space:nowrap">© 2026 PTEC SOLUTIONS · DIREITOS RESERVADOS</div>
          </div>
          <img src="https://fifa-world-cup-2026-virtual-collection.vercel.app/PTEC_Solutions_logo_VECTOR.svg"
               alt="PTEC Solutions" style="position:absolute;right:14px;top:50%;transform:translateY(-51%);height:58px;opacity:0.55" />
        </div>
      </div>
    `,
  }),
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const token = req.headers.get("Authorization")?.replace("Bearer ", "") ?? "";
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), { status: 401, headers: corsHeaders });
    }

    const { type, teamName, flag, group } = await req.json();
    const userName = user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "Colecionador";
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) throw new Error("RESEND_API_KEY não configurada");

    let template;
    if (type === "team")  template = TEMPLATES.team(userName, teamName, flag);
    if (type === "group") template = TEMPLATES.group(userName, group);
    if (type === "album") template = TEMPLATES.album(userName);

    if (!template) {
      return new Response(JSON.stringify({ error: "Tipo inválido" }), { status: 400, headers: corsHeaders });
    }

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev",
        to: [user.email],
        subject: template.subject,
        html: template.html,
      }),
    });

    if (!emailRes.ok) {
      const err = await emailRes.text();
      console.error("[send-achievement-email] Resend error:", err);
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });

  } catch (e) {
    console.error("[send-achievement-email] Erro:", e.message);
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
  }
});
