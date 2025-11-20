# 🚀 Quick Deploy Guide (15 Minutes)

## What You'll Deploy
- ✅ Backend API on Render (Free)
- ✅ Web App on Vercel (Free)
- ✅ Mobile App via Expo Go

---

## 1️⃣ MongoDB Setup (3 min)

1. Go to https://mongodb.com/cloud/atlas
2. Sign up → Create Free Cluster
3. Click "Connect" → Copy connection string
4. Replace `<password>` and add `/findmygang` at end
5. Network Access → Allow 0.0.0.0/0

**Your MongoDB URI:**
```
mongodb+srv://username:password@cluster.mongodb.net/findmygang
```

---

## 2️⃣ Deploy Backend (5 min)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Deploy"
   git push origin main
   ```

2. **Render.com:**
   - New Web Service → Connect GitHub repo
   - Root Directory: `backend`
   - Build: `npm install`
   - Start: `node server.js`

3. **Environment Variables:**
   ```
   PORT=5000
   MONGODB_URI=<your-mongodb-uri>
   JWT_SECRET=mySecretKey123
   NODE_ENV=production
   CLIENT_URL=https://temp.com
   ```

4. **Deploy** → Copy URL: `https://your-backend.onrender.com`

---

## 3️⃣ Deploy Frontend (5 min)

1. **Update `web/.env.production`:**
   ```env
   VITE_API_URL=https://your-backend.onrender.com/api
   VITE_SOCKET_URL=https://your-backend.onrender.com
   ```

2. **Push changes:**
   ```bash
   git add .
   git commit -m "Update production URLs"
   git push
   ```

3. **Vercel.com:**
   - Import Project → Select repo
   - Root Directory: `web`
   - Framework: Vite

4. **Environment Variables:**
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   VITE_SOCKET_URL=https://your-backend.onrender.com
   ```

5. **Deploy** → Copy URL: `https://your-app.vercel.app`

---

## 4️⃣ Update Backend (2 min)

1. **Render Dashboard:**
   - Go to your backend service
   - Environment → Edit `CLIENT_URL`
   - Set to: `https://your-app.vercel.app`
   - Save (auto-redeploys)

---

## 5️⃣ Update Mobile (1 min)

**Edit `mobile/config/constants.js`:**
```javascript
export const API_URL = 'https://your-backend.onrender.com/api';
export const SOCKET_URL = 'https://your-backend.onrender.com';
```

**Restart Expo:**
```bash
cd mobile
npx expo start --clear
```

---

## ✅ Test Everything

1. **Backend:** Visit `https://your-backend.onrender.com/health`
2. **Frontend:** Visit `https://your-app.vercel.app`
3. **Mobile:** Scan QR code in Expo Go

---

## 🎉 Done!

Your app is now live:
- 🌐 Web: `https://your-app.vercel.app`
- 📱 Mobile: Use Expo Go
- 🔧 Backend: `https://your-backend.onrender.com`

---

## ⚠️ Important Notes

- **First load may be slow** (Render free tier sleeps)
- **MongoDB:** Ensure IP whitelist is set to 0.0.0.0/0
- **CORS:** Frontend URL must match exactly in backend
- **HTTPS:** Mobile requires HTTPS (not HTTP)

---

## 🆘 Troubleshooting

**Backend not responding?**
→ Check Render logs, verify MongoDB URI

**CORS errors?**
→ Update CLIENT_URL in Render to match Vercel URL exactly

**Mobile can't connect?**
→ Ensure URLs in constants.js are HTTPS

**Database errors?**
→ Check MongoDB Atlas IP whitelist and connection string

---

## 📚 Full Documentation

- `DEPLOYMENT_GUIDE.md` - Complete deployment guide
- `DEPLOY_STEPS.md` - Detailed step-by-step instructions
- `DEPLOYMENT_CHECKLIST.md` - Deployment checklist

---

## 🔄 Auto-Deployment

Both Render and Vercel auto-deploy when you push to `main` branch!

```bash
git add .
git commit -m "Update feature"
git push origin main
```

That's it! 🚀
