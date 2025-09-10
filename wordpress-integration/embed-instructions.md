# 🎂 Kockabarlang WordPress Integráció

## Gyors Beállítási Útmutató

### 1. GitHub Repository Beállítása
1. Kapcsolja GitHub fiókját a Lovable projekthez
2. Push-olja a kódot a GitHub repository-ba
3. Engedélyezze a GitHub Pages-t a repository Settings > Pages menüpontban
4. Válassza ki a "GitHub Actions" source-ot

### 2. Automatikus Deployment
A GitHub Actions workflow automatikusan futni fog minden push után a main ágra:
- Build elkészítése
- GitHub Pages-re való deployment
- Élő URL generálása: `https://[username].github.io/kockabarlang-party-planner/`

### 3. WordPress Beágyazás

#### Elementor Használatával:
1. **HTML Widget hozzáadása**
   - Húzzon egy HTML widgetet a kívánt helyre
   - Másolja be az iframe kódot a `wordpress-integration/iframe-embed.html` fájlból

2. **Kód testreszabása**
   ```html
   <iframe 
     src="https://[YOUR-USERNAME].github.io/kockabarlang-party-planner/"
     width="100%" 
     height="700"
     style="border: none; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"
     title="Kockabarlang Születésnapi Foglalás"
     loading="lazy">
   </iframe>
   ```

#### Gutenberg Editor-ral:
1. **Custom HTML Block hozzáadása**
2. **Iframe kód beillesztése**
3. **Előnézet és mentés**

### 4. Mobiloptimalizálás
```css
@media (max-width: 768px) {
  .kockabarlang-iframe {
    height: 600px !important;
    min-height: 500px !important;
  }
}
```

### 5. Stílus Testreszabás
```css
.kockabarlang-booking-container {
  max-width: 900px;
  margin: 20px auto;
  padding: 20px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}
```

### 6. Funkcionális Előnyök
- ✅ Automatikus deployment minden kód változtatásnál
- ✅ Teljes funkcionalitás megőrzése
- ✅ Supabase adatbázis kapcsolat
- ✅ Reszponzív design
- ✅ Gyors betöltés optimalizált bundle-lel
- ✅ CSS izolálás WordPress témákkal szembeni konfliktusok elkerülésére

### 7. Hibaelhárítás

#### Iframe nem jelenik meg:
- Ellenőrizze a HTTPS protokollt
- Győződjön meg róla, hogy a GitHub Pages URL elérhető
- Tekintse meg a böngésző konzolt hibák után

#### Stílus konfliktusok:
- Használja a CSS izolációs technikákat
- Alkalmazza specifikus CSS szelektorokat

#### Adatbázis kapcsolat problémák:
- Ellenőrizze a Supabase CORS beállításokat
- Győződjön meg róla, hogy a production URL engedélyezett

### 8. Biztonság
- Az iframe sandbox attribútumok használata ajánlott
- HTTPS protokoll kötelező
- CORS beállítások ellenőrzése Supabase-ben

## Technikai Támogatás
Ha problémája van az integrációval, ellenőrizze:
1. GitHub Actions build logokat
2. Böngésző fejlesztői eszközök Network tab-ot
3. Supabase dashboard logs-ot