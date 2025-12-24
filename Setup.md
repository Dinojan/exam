## After Hosting Setup Instructions

Follow these steps **after uploading the project to cPanel / hosting**.

---

### 1. Upload Project Files

- Upload all project files to:
  - `public_html/` **OR**
  - `public_html/NIT/exam/` (if using subfolder)

---

### 2. Update `.htaccess`

If project is inside a subfolder:

```apache
RewriteBase /NIT/exam/
```

If project is in root (`public_html`):

```apache
RewriteBase /
```

---

### 3. Update `.env` file (Production)

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com
IS_CPANEL=true
```

---

### 4. Database Setup

1. cPanel → MySQL Databases
2. Create:
    - Database
    - User
3. Assign user to database (**ALL PRIVILEGES**)

Update `.env`:
```env
DB_HOST=localhost
DB_DATABASE=cpanel_dbname
DB_USERNAME=cpanel_dbuser
DB_PASSWORD=strong_password
```

---

### 5. Import Database
- cPanel → phpMyAdmin
- Select database
- Import `.sql` file

--- 

### 6. Folder Permissions
Set permissions:
- `uploads/` → **755** or **775**
- `logs/` → **755**
- `cache/` (if exists) → **755**

---

### 7. Composer (If allowed on hosting)
```bash
composer install --no-dev
```

If composer not available:
- Upload `vendor/` folder from localhost

---

### 8. Final Test
- Login
- Profile update
- Exam start
- PDF export
- Logout

If all work → ✅ Deployment Success