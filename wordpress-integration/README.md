# 🎂 Kockabarlang WordPress Beágyazás

## ⚡ Gyors Telepítés

### 1. GitHub Pages URL Cseréje
```
https://yourusername.github.io/kockabarlang-party-planner/
```
↓ Cserélje le erre:
```
https://[AZ-ÖN-GITHUB-FELHASZNÁLÓNEVE].github.io/kockabarlang-party-planner/
```

### 2. Elementor Beágyazás (Egyszerű)
1. **HTML Widget** hozzáadása
2. Kód beillesztése:
```html
<iframe 
  src="https://[AZ-ÖN-GITHUB-FELHASZNÁLÓNEVE].github.io/kockabarlang-party-planner/"
  width="100%" 
  height="700"
  style="border: none; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"
  title="Születésnapi Foglalás">
</iframe>
```

### 3. Gutenberg Beágyazás
1. **Custom HTML Block**
2. Ugyanaz a kód, mint fent

## 🎨 Stílus Testreszabás

### Kerek sarkok és árnyék:
```css
.booking-iframe {
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  overflow: hidden;
}
```

### Mobil optimalizálás:
```css
@media (max-width: 768px) {
  .booking-iframe {
    height: 600px !important;
  }
}
```

## 🔧 Hibaelhárítás

### Nem látszik az iframe?
- ✅ HTTPS használata kötelező
- ✅ GitHub Pages engedélyezve
- ✅ Repository public

### Stílus konfliktusok?
- ✅ CSS izolálás beépítve
- ✅ Specifikus CSS osztályok használata

## 📱 Reszponzív Verziók

### Teljes szélesség:
```html
<div style="width: 100%; max-width: 800px; margin: 0 auto;">
  <iframe src="YOUR-URL" width="100%" height="700" style="border:none;"></iframe>
</div>
```

### Oldalsáv verzió:
```html
<iframe src="YOUR-URL" width="400" height="600" style="border:none; border-radius:8px;"></iframe>
```

## 💡 Pro Tippek

1. **Magasság beállítása**: 700px optimális desktop-ra, 600px mobil-ra
2. **Betöltési sebesség**: `loading="lazy"` attribútum használata
3. **Biztonság**: Mindig HTTPS protokoll
4. **SEO**: `title` attribútum megadása

## 🎯 Automatikus Frissítések

✅ Minden kód módosítás automatikusan megjelenik  
✅ Nincs szükség manuális frissítésre  
✅ GitHub Actions gondoskodik a deployment-ról