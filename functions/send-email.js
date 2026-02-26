// This code goes into your Cloudflare Worker
export default {
  async fetch(request, env) {
    // Enable CORS so your website can talk to the worker
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    if (request.method === "POST") {
      try {
        const data = await request.json();

        // 1. Send to Resend
        const resendResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "Acme <onboarding@resend.dev>", // Replace with your verified domain later
            to: ["your-email@gmail.com"], // Your actual email
            subject: `New Lead: ${data.name}`,
            html: `
              <h2>New Client Assessment</h2>
              <p><strong>Name:</strong> ${data.name}</p>
              <p><strong>Email:</strong> ${data.email}</p>
              <p><strong>Phone:</strong> ${data.phone}</p>
              <p><strong>Goal:</strong> ${data.goal}</p>
              <p><strong>Medical:</strong> ${data.medicalConditions.join(", ")}</p>
              <p><strong>Injuries:</strong> ${data.injuries}</p>
              <p><strong>Metrics:</strong> H:${data.height}cm | W:${data.weight}kg</p>
            `,
          }),
        });

        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
      }
    }
  },
};