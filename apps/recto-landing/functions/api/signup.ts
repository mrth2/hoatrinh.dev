interface Env {
  RESEND_API_KEY?: string;
  RESEND_SEGMENT_ID?: string;
}

interface SignupRequest {
  email?: string;
}

interface Context {
  request: Request;
  env: Env;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function onRequestPost(context: Context): Promise<Response> {
  const payload = (await context.request.json()) as SignupRequest;
  const email = payload.email?.trim().toLowerCase();

  if (email === undefined || !EMAIL_REGEX.test(email)) {
    return json(
      {
        message: 'Please provide a valid email address.',
      },
      400,
    );
  }

  const apiKey = context.env.RESEND_API_KEY;
  const segmentId = context.env.RESEND_SEGMENT_ID;

  if (apiKey === undefined || segmentId === undefined) {
    return json(
      {
        message: 'Signup endpoint is not configured yet.',
      },
      500,
    );
  }

  const response = await fetch('https://api.resend.com/contacts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      email,
      unsubscribed: false,
      segments: [segmentId],
    }),
  });

  if (!response.ok && response.status !== 409) {
    return json(
      {
        message: 'Signup failed. Please try again in a bit.',
      },
      502,
    );
  }

  return json(
    {
      message: 'Saved. You will get first access updates.',
    },
    200,
  );
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
      'cache-control': 'no-store',
    },
  });
}
