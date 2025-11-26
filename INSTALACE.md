# INSTALACE Stremio Addonu Dokumenty.TV (CZ/SK)

Tento neoficiální addon musíte spustit na vlastním serveru a v Stremiu jej přidat jako vývojářský doplněk. Doporučujeme Render pro bezplatné hostování.

## Krok 1 – připravit repozitář
1. Ujistěte se, že soubory `package.json`, `manifest.json`, `addon.js` a dokumentace jsou ve složce projektu.
2. Vytvořte repozitář na GitHubu a nahrajte soubory.

## Krok 2 – nasazení na Render
1. Přihlaste se do Render (doporučeno propojení s GitHubem).
2. Vytvořte **New → Web Service**.
3. Vyberte repozitář a zadejte konfiguraci:
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Po nasazení získáte veřejnou URL (např. `https://dokumenty-tv-addon-xxxx.onrender.com`).

## Krok 3 – instalace v Stremiu
1. Otevřete Stremio → Add-ons → Development Add-ons.
2. Zadejte URL: `[Veřejná URL]/manifest.json`
3. Klikněte `Install`.

