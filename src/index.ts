document.body.style.overflowY = "hidden";
import {
  ViewerApp,
  AssetManagerPlugin,
  timeout,
  SSRPlugin,
  mobileAndTabletCheck,
  GBufferPlugin,
  ProgressivePlugin,
  TonemapPlugin,
  SSAOPlugin,
  GroundPlugin,
  FrameFadePlugin,
  DiamondPlugin,
  // DepthOfFieldPlugin,
  BufferGeometry,
  MeshStandardMaterial2,
  BloomPlugin,
  TemporalAAPlugin,
  AssetImporter,
  Color,
  Mesh,
} from "webgi";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./styles.scss";

gsap.registerPlugin(ScrollTrigger);

async function setupViewer() {
  const canvas = document.getElementById("webgi-canvas") as HTMLCanvasElement;
  const viewer = new ViewerApp({
    canvas,
    useGBufferDepth: true,
    isAntialiased: false,
  });

  const isMobile = mobileAndTabletCheck();

  viewer.renderer.displayCanvasScaling = Math.min(window.devicePixelRatio, 1);

  const manager = await viewer.addPlugin(AssetManagerPlugin);
  const camera = viewer.scene.activeCamera;
  const position = camera.position;
  const target = camera.target;

  // Interface Elements
  let firstLooad = true;

  // Add WEBGi plugins
  await viewer.addPlugin(GBufferPlugin);
  await viewer.addPlugin(new ProgressivePlugin(32));
  await viewer.addPlugin(
    new TonemapPlugin(true, false)
  );
  const ssr = await viewer.addPlugin(SSRPlugin);
  const ssao = await viewer.addPlugin(SSAOPlugin);
  await viewer.addPlugin(FrameFadePlugin);
  await viewer.addPlugin(GroundPlugin);
  const bloom = await viewer.addPlugin(BloomPlugin);
  await viewer.addPlugin(TemporalAAPlugin);
  await viewer.addPlugin(DiamondPlugin);
  // const dof = await viewer.addPlugin(DepthOfFieldPlugin)
  // await viewer.addPlugin(RandomizedDirectionalLightPlugin, false)
  viewer.setBackground(new Color('white').convertSRGBToLinear());

  ssr!.passes.ssr.passObject.lowQualityFrames = 0;
  bloom.pass!.passObject.bloomIterations = 2;
  ssao.passes.ssao.passObject.material.defines.NUM_SAMPLES = 4;

  // WEBGi loader
  const importer = manager.importer as AssetImporter;

  importer.addEventListener("onStart", (ev) => {
    // onUpdate()
  });

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

  viewer.renderer.refreshPipeline();

  // WEBGi load model
  await manager.addFromPath("./assets/neura.glb");

  let neura: Mesh<BufferGeometry, MeshStandardMaterial2>;

  neura = viewer.scene.findObjectsByName("Scene")[0] as any as Mesh<
    BufferGeometry,
    MeshStandardMaterial2
  >;

  if (camera.controls) {
    camera.controls!.enabled = false;
  }

  // WEBGi mobile adjustments
  if (isMobile) {
    ssr.passes.ssr.passObject.stepCount /= 2;
    bloom.enabled = false;
    camera.setCameraOptions({ fov: 65 });
  }

  window.scrollTo(0, 0);

  await timeout(50);

  function introAnimation() {
    firstLooad = false;
    const introTL = gsap.timeline();
    introTL
      .to(".loader", {
        x: "100%",
        duration: 0.8,
        ease: "power4.inOut",
        delay: 1,
      })
      .fromTo(
        position,
        { x: 2.65, y: 5.74, z: -10.1 },
        { x: -1.05, y: 3.59, z: -6.17, duration: 4, onUpdate },
        "-=0.8"
      )

      .fromTo(
        target,
        { x: 5.65, y: 0.49, z: -1.84 },
        { x: 1.01, y: -0.01, z: -0.48, duration: 4, onUpdate },
        "-=4"
      )

      .fromTo(
        ".header--container",
        { opacity: 0, y: "-100%" },
        { opacity: 1, y: "0%", ease: "power1.inOut", duration: 0.8 },
        "-=1"
      )
      .fromTo(
        ".hero--container",
        { opacity: 0, x: "-100%" },
        {
          opacity: 1,
          x: "0%",
          ease: "power4.inOut",
          duration: 1.8,
          onComplete: setupScrollAnimation,
        },
        "-=1"
      )
      .fromTo(
        ".side-bar",
        { opacity: 0, x: "50%" },
        { opacity: 1, x: "0%", ease: "power4.inOut", duration: 2 },
        "-=1"
      )
      .to(
        ".side-bar .neura",
        { opacity: 1, scale: 1.5, ease: "power4.inOut", duration: 2 },
        "-=1"
      );
  }

  function setupScrollAnimation() {
    document.body.style.overflowY = "scroll";

    const tl = gsap.timeline({ default: { ease: "none" } });

    // tech
    tl.to(position, {
      x: -1.83,
      y: -0.14,
      z: 6.15,
      scrollTrigger: {
        trigger: ".cam-view-2",
        start: "top bottom",
        end: "top top",
        scrub: true,
        immediateRender: false,
      },
      onUpdate,
    })

      .to(target, {
        x: -0.78,
        y: -0.03,
        z: -1,
        scrollTrigger: {
          trigger: ".cam-view-2",
          start: "top bottom",
          end: "top top",
          scrub: true,
          immediateRender: false,
        },
      })
      .to(neura.rotation, {
        x: 0,
        y: 0,
        z: Math.PI / 2,
        scrollTrigger: {
          trigger: ".cam-view-2",
          start: "top bottom",
          end: "top top",
          scrub: true,
          immediateRender: false,
        },
      })

      .to(".hero--container", {
        opacity: 0,
        xPercent: "-100",
        ease: "power4.out",
        scrollTrigger: {
          trigger: ".cam-view-2",
          start: "top bottom",
          end: "top top",
          scrub: 1,
          immediateRender: false,
        },
      })

      .to(".tech--text-bg", {
        opacity: 0.1,
        ease: "power4.inOut",
        scrollTrigger: {
          trigger: ".cam-view-2",
          start: "top bottom",
          end: "top top",
          scrub: true,
          immediateRender: false,
        },
      })

      .fromTo(
        ".tech--container",
        { opacity: 0, x: "-110%" },
        {
          opacity: 1,
          x: "0%",
          ease: "power4.inOut",
          scrollTrigger: {
            trigger: ".cam-view-2",
            start: "top bottom",
            end: "top top",
            scrub: true,
            immediateRender: false,
          },
        }
      )
      .addLabel("tech")
      .to(".side-bar .neura", {
        opacity: 0.5,
        scale: 1,
        ease: "power4.inOut",
        duration: 2,
        scrollTrigger: {
          trigger: ".cam-view-2",
          start: "top bottom",
          end: "top top",
          scrub: true,
          immediateRender: false,
        },
      })
      .to(".side-bar .tech", {
        opacity: 1,
        scale: 1.5,
        ease: "power4.inOut",
        duration: 2,
        scrollTrigger: {
          trigger: ".cam-view-2",
          start: "top bottom",
          end: "top top",
          scrub: true,
          immediateRender: false,
        },
      })

      // // ICOME SECTION
      .to(position, {
        x: -0.06,
        y: -1.15,
        z: 4.42,
        scrollTrigger: {
          trigger: ".cam-view-3",
          start: "top bottom",
          end: "top top",
          scrub: true,
          immediateRender: false,
        },
        onUpdate,
      })
      .to(target, {
        x: -0.01,
        y: 0.9,
        z: 0.07,
        scrollTrigger: {
          trigger: ".cam-view-3",
          start: "top bottom",
          end: "top top",
          scrub: true,
          immediateRender: false,
        },
        onUpdate,
      })
      .to(neura.rotation, {
        x: 0.92,
        y: 0.92,
        z: -Math.PI / 3,
        scrollTrigger: {
          trigger: ".cam-view-3",
          start: "top bottom",
          end: "top top",
          scrub: true,
          immediateRender: false,
        },
      })
      .to(".tech--container", {
        opacity: 0,
        x: "-110%",
        ease: "power4.inOut",
        scrollTrigger: {
          trigger: ".cam-view-3",
          start: "top bottom",
          end: "top top",
          scrub: true,
          immediateRender: false,
        },
      })
      .fromTo(
        ".income--content",
        { opacity: 0, y: "130%" },
        {
          opacity: 1,
          y: "0%",
          ease: "power4.inOut",
          scrollTrigger: {
            trigger: ".cam-view-3",
            start: "top bottom",
            end: "top top",
            scrub: true,
            immediateRender: false,
          },
        }
      )

      .addLabel("income")
      .to(".side-bar .tech", {
        opacity: 0.5,
        scale: 1,
        ease: "power4.inOut",
        duration: 2,
        scrollTrigger: {
          trigger: ".cam-view-3",
          start: "top bottom",
          end: "top top",
          scrub: true,
          immediateRender: false,
        },
      })
      .to(".side-bar .income", {
        opacity: 1,
        scale: 1.5,
        ease: "power4.inOut",
        duration: 2,
        scrollTrigger: {
          trigger: ".cam-view-3",
          start: "top bottom",
          end: "top top",
          scrub: true,
          immediateRender: false,
        },
      });
  }

  let needsUpdate = true;
  function onUpdate() {
    needsUpdate = true;
  }

  viewer.addEventListener("preFrame", () => {
    if (needsUpdate) {
      camera.positionUpdated(false);
      camera.targetUpdated(true);
      needsUpdate = false;
    }
  });
}

setupViewer();
