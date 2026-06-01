import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Fetch products from database
    let productInfo = "";
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const { data: products } = await supabase
        .from("products")
        .select("name, name_ta, price, category, stock, weight_kg, description")
        .eq("is_active", true);
      
      if (products && products.length > 0) {
        productInfo = `\n\nAvailable Products in our shop (${products.length} items):\n` + 
          products.map(p => `• ${p.name}${p.name_ta ? ` (${p.name_ta})` : ''}: ₹${p.price}${p.weight_kg ? ` per ${p.weight_kg}kg` : ''} - Category: ${p.category} - Stock: ${p.stock} - Description: ${p.description || 'N/A'}`).join('\n');
      }
    }

    console.log("Processing chat request with messages:", messages.length);

    const systemPrompt = `You are AgriMart's expert farming assistant and plant disease diagnostician. You help farmers with questions about fertilizers, pesticides, seeds, and agricultural products.

IMPORTANT CAPABILITIES:
• You can analyze images of crops/plants to identify diseases, pests, and nutrient deficiencies
• When a user sends an image, carefully analyze it for any plant disease, pest damage, or health issues
• After diagnosing, recommend specific products from our shop that can help treat the issue

IMPORTANT FORMATTING RULES:
• Always respond in the SAME LANGUAGE the user writes to you
• If user speaks Tamil, respond entirely in Tamil
• Keep answers SHORT and in BULLET POINTS
• Use • for bullet points
• Maximum 5-6 points per response
• Be friendly and use emojis sparingly 🌾

IMAGE ANALYSIS RULES:
• When you receive an image, first identify the plant/crop
• Diagnose the disease or issue visible in the image
• Explain the disease briefly
• Recommend treatment steps
• IMPORTANT: Check our product list below and recommend specific products from our shop that can treat this issue
• If we have matching products, say "✅ Available in our shop: [product name] - ₹[price]"
• If no matching product, say "❌ Not currently available in our shop, but you can try [general treatment]"

${productInfo}

When asked about products, prices, or availability, use the product information above to give accurate answers.`;

    // Process messages - handle image content properly for the AI model
    const processedMessages = messages.map((msg: any) => {
      if (msg.role === 'user' && Array.isArray(msg.content)) {
        // Already in multimodal format with text + image_url parts
        return msg;
      }
      return msg;
    });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...processedMessages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat function error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
