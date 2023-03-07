import {
  ViewerApp,
  CanvasSnipperPlugin,
  AssetManagerPlugin,
  AssetImporter,
} from "webgi";
import "./styles/showcase.scss";
import gsap from "gsap";

async function setupViewer() {
  // Initialize the viewer
  const viewer = new ViewerApp({
    canvas: document.getElementById("webgi-canvas") as HTMLCanvasElement,
  });
  const manager = await viewer.addPlugin(AssetManagerPlugin);

  let firstLooad = true;

  await viewer.addPlugin(CanvasSnipperPlugin);

  viewer.renderer.refreshPipeline();

  const importer = manager.importer as AssetImporter;

  importer.addEventListener("onProgress", (ev) => {
    const progressRatio = ev.loaded / ev.total;
    document
      .querySelector(".progress")
      ?.setAttribute("style", `transform: scaleX(${progressRatio})`);
  });

  importer.addEventListener("onLoad", (ev) => {
    if (firstLooad) {
      introAnimation();
    } else {
      gsap.to(".loader", {
        x: "100%",
        duration: 0.8,
        ease: "power4.inOut",
        delay: 1,
      });
    }
  });

  // Load model
  await manager.addFromPath("./assets/neura2.glb");

  function introAnimation() {
    firstLooad = false;
    const introTL = gsap.timeline();
    introTL.to(".loader", {
      x: "100%",
      duration: 0.8,
      ease: "power4.inOut",
      delay: 1,
    });
  }
}

setupViewer();
