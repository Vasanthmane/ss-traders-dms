SS Traders DMS UI + stability patch

Included fixes:
- Next.js config compatible with 14.2.x
- Neon DB helper fixed (no sql.unsafe)
- Schema adds work_categories and folder_types tables
- Global theme refresh (better fonts, darker premium background)
- Existing dashboard/settings/components preserved and styled through the new theme

How to apply:
1. unzip this patch zip
2. copy the contents into your project root, replacing files
3. run npm install
4. run the updated scripts/schema.sql in Neon SQL Editor
5. run npm run dev
6. when ready, commit and push to GitHub, then redeploy on Vercel
