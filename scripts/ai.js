const BASE_URL = process.env.BASE_URL;

export async function openai(text) {
  try {
    const res = await fetch(`${BASE_URL}/openai?text=${text}`).then((res) =>
      res.json()
    );
    return res.result;
  } catch (e) {
    return e.message;
  }
}
