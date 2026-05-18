import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { create as createJWT, getNumericDate } from "https://deno.land/x/djwt@v2.8/mod.ts"

serve(async (req) => {
  try {
    const { user_id, title, body, destination } = await req.json()

    // 1. Obtener secretos
    const projectId = Deno.env.get('FIREBASE_PROJECT_ID')
    const clientEmail = Deno.env.get('FIREBASE_CLIENT_EMAIL')
    let privateKey = Deno.env.get('FIREBASE_PRIVATE_KEY')

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error('Faltan variables de entorno de Firebase')
    }

    // Corregir formato de la llave privada si viene con \n literales
    privateKey = privateKey.replace(/\\n/g, '\n')

    // 2. Generar Access Token para FCM v1 usando JWT
    const jwt = await createJWT(
      { alg: "RS256", typ: "JWT" },
      {
        iss: clientEmail,
        sub: clientEmail,
        aud: "https://oauth2.googleapis.com/token",
        iat: getNumericDate(0),
        exp: getNumericDate(3600),
        scope: "https://www.googleapis.com/auth/firebase.messaging",
      },
      await crypto.subtle.importKey(
        "pkcs8",
        Uint8Array.from(atob(privateKey.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, "")), c => c.charCodeAt(0)),
        { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
        false,
        ["sign"]
      )
    )

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }),
    })
    const { access_token } = await tokenResponse.json()

    // 3. Inicializar Supabase Admin para buscar el token del dispositivo
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: tokens } = await supabase
      .from('user_fcm_tokens')
      .select('fcm_token')
      .eq('user_id', user_id)

    if (!tokens || tokens.length === 0) {
      return new Response(JSON.stringify({ error: 'Dispositivo no registrado' }), { status: 404 })
    }

    // 4. Enviar notificaciones
    const results = await Promise.all(tokens.map(async (t) => {
      const payload: any = {
        token: t.fcm_token,
        notification: { title, body },
        android: {
          priority: 'high',
        }
      }

      if (destination) {
        payload.data = { destination: String(destination) }
      }

      return fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`,
        },
        body: JSON.stringify({ message: payload }),
      }).then(r => r.json())
    }))

    return new Response(JSON.stringify({ success: true, results }), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
