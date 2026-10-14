import { expect, test } from "@playwright/test";
test("crea, busca, edita, marca favorito, exporta y elimina una canción en demo", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Nueva letra" }).click();
  await page.getByLabel("Título de la canción").fill("Mi canción");
  await page
    .getByLabel("Letra sin acordes")
    .fill("Primera estrofa\n\nCoro de prueba");
  await page.getByRole("button", { name: "Guardar canción" }).click();
  await page.getByPlaceholder("Buscar por título").fill("Mi canción");
  const card = page.locator("article").filter({ hasText: "Mi canción" });
  await expect(card).toHaveCount(1);
  await card.getByRole("button", { name: "Favorito", exact: true }).click();
  await card.getByTitle("Abrir canción").click();
  await page.getByLabel("Título de la canción").fill("Mi canción corregida");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportar .txt" }).click();
  expect((await download).suggestedFilename()).toBe("Mi canción corregida.txt");
  await page.getByRole("button", { name: "Guardar canción" }).click();
  page.once("dialog", (dialog) => dialog.accept());
  await page
    .locator("article")
    .filter({ hasText: "Mi canción corregida" })
    .getByTitle("Eliminar canción")
    .click();
  await expect(
    page.locator("article").filter({ hasText: "Mi canción corregida" }),
  ).toHaveCount(0);
});
test("la PWA publica manifest, iconos y service worker", async ({
  page,
  request,
}) => {
  await page.goto("/");
  const manifest = await (await request.get("/manifest.webmanifest")).json();
  expect(manifest.display).toBe("standalone");
  for (const icon of manifest.icons)
    expect((await request.get(icon.src)).ok()).toBeTruthy();
  expect((await request.get("/sw.js")).ok()).toBeTruthy();
  await expect
    .poll(() =>
      page.evaluate(async () =>
        Boolean((await navigator.serviceWorker.getRegistration())?.active),
      ),
    )
    .toBe(true);
});
test("conserva recorte y giro por página y prepara el JPEG correcto", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Escanear canción", exact: true })
    .click();
  const image = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 320;
    canvas.height = 640;
    const context = canvas.getContext("2d")!;
    context.fillStyle = "white";
    context.fillRect(0, 0, 320, 640);
    context.fillStyle = "black";
    context.font = "24px sans-serif";
    context.fillText("Canción de prueba", 20, 150);
    return canvas.toDataURL().split(",")[1];
  });
  await page.locator('input[type="file"]').setInputFiles([
    {
      name: "pagina1.png",
      mimeType: "image/png",
      buffer: Buffer.from(image, "base64"),
    },
    {
      name: "pagina2.png",
      mimeType: "image/png",
      buffer: Buffer.from(image, "base64"),
    },
  ]);
  const stage = page.locator(".image-stage");
  await stage.scrollIntoViewIfNeeded();
  const bounds = await stage.boundingBox();
  if (!bounds) throw new Error("No hay imagen para recortar");
  await page.mouse.move(
    bounds.x + bounds.width * 0.1,
    bounds.y + bounds.height * 0.1,
  );
  await page.mouse.down();
  await page.mouse.move(
    bounds.x + bounds.width * 0.9,
    bounds.y + bounds.height * 0.9,
    { steps: 5 },
  );
  await page.mouse.up();
  await page.getByRole("button", { name: "Girar 90°" }).click();
  const crop = await page.locator(".crop-overlay").getAttribute("style");
  const cropWidth = await page
    .locator(".crop-overlay")
    .evaluate((element) => parseFloat((element as HTMLElement).style.width));
  expect(cropWidth).toBeCloseTo(80, 0);
  await page.getByRole("button", { name: "Pág. 2" }).click();
  await page.getByRole("button", { name: "Pág. 1" }).click();
  expect(await page.locator(".crop-overlay").getAttribute("style")).toBe(crop);
  await page.getByRole("button", { name: "Preparar imagen" }).click();
  const preview = page.getByAltText("Imagen preparada");
  await expect(preview).toBeVisible();
  const dimensions = await preview.evaluate((element: HTMLImageElement) => ({
    width: element.naturalWidth,
    height: element.naturalHeight,
  }));
  expect(dimensions.width).toBeGreaterThan(dimensions.height);
  expect(Math.abs(dimensions.width - 512)).toBeLessThanOrEqual(3);
  expect(Math.abs(dimensions.height - 256)).toBeLessThanOrEqual(3);
  await page.screenshot({
    path: testInfo.outputPath("scanner.png"),
    fullPage: true,
  });
});
