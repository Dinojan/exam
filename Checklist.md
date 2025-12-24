## cPanel Deployment Checklist

Use this checklist to confirm everything works correctly.

---

### 🔐 Environment
- [ ] APP_ENV = production
- [ ] APP_DEBUG = false
- [ ] Correct APP_URL

---

### 🗄 Database
- [ ] Database created
- [ ] User assigned with ALL privileges
- [ ] Tables imported successfully
- [ ] No DB connection error

---

### 📂 Files & Paths
- [ ] `.htaccess` RewriteBase correct
- [ ] `vendor/` folder exists
- [ ] `uploads/` writable
- [ ] `logs/` writable

---

### 🔑 Authentication
- [ ] Login works
- [ ] Logout works
- [ ] Session persists

---

### 👤 User Features
- [ ] Profile view
- [ ] Profile update
- [ ] Password change
- [ ] Avatar upload

---

### 📝 Exam System
- [ ] Exam list loads
- [ ] Exam starts
- [ ] Timer works
- [ ] Submission works
- [ ] Result calculation correct

---

### 📄 PDF Export
- [ ] dompdf loads
- [ ] PDF downloads
- [ ] Fonts render correctly

---

### 🔒 Security
- [ ] Debug disabled
- [ ] No error shown to users
- [ ] `.env` not publicly accessible

---

### ✅ Final Status
If all boxes are checked → **READY FOR PRODUCTION 🚀**

---

## ✔ Production `.env` Template
```env
# ===============================
# Application
# ===============================
APP_NAME=Online Exam
APP_VERSION=1.0.0
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com
APP_FOLDER=
IS_CPANEL=true

# ===============================
# Database
# ===============================
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=cpanel_database
DB_USERNAME=cpanel_user
DB_PASSWORD=strong_password_here

# ===============================
# Security & Performance
# ===============================
NEED_SEEDS=false
SESSION_SECURE=true
SESSION_HTTP_ONLY=true

# ===============================
# Timezone
# ===============================
APP_TIMEZONE=Asia/Colombo
```