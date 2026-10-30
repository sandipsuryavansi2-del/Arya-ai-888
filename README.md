# Aryan AI Cloud — OpenAI version

## Deploy to Vercel
Upload these files and folders to the root of your GitHub repository:

- `index.html`
- `package.json`
- `vercel.json`
- `api/chat.js`

## Add OpenAI API settings in Vercel
Open **Vercel Dashboard → your project → Settings → Environment Variables** and add:

| Name | Value |
|---|---|
| `AI_PROVIDER` | `openai` |
| `AI_API_KEY` | Your secret OpenAI API key (starts with `sk-`) |
| `AI_MODEL` | `gpt-4o-mini` |

Select Production (and Preview if needed), save, then go to **Deployments** and redeploy.

**Important:** The ZIP does not contain an API key. Add your own key directly in Vercel. Never paste it into `index.html`, GitHub, or a public chat.

## Test
Open `https://YOUR-PROJECT.vercel.app/api/chat`. It should return JSON with `"configured": true` after the key is added and redeployed. Then open the site and send a chat message.

The OpenAI API is billed separately from a ChatGPT subscription and may require API billing/credits.
