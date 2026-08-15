import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Loader2, MoveHorizontal } from 'lucide-react';

/** Cria o contorno de uma camiseta em THREE.Shape */
function createShirtShape() {
  const s = new THREE.Shape();
  s.moveTo(-0.7, 1.4);
  s.quadraticCurveTo(0, 1.05, 0.7, 1.4);
  s.lineTo(1.2, 1.25);
  s.lineTo(1.6, 0.5);
  s.lineTo(1.45, 0.05);
  s.lineTo(1.05, 0.25);
  s.lineTo(1.05, -1.6);
  s.lineTo(-1.05, -1.6);
  s.lineTo(-1.05, 0.25);
  s.lineTo(-1.45, 0.05);
  s.lineTo(-1.6, 0.5);
  s.lineTo(-1.2, 1.25);
  s.lineTo(-0.7, 1.4);
  return s;
}

/** Cria um plano curvo que se conforma à superfície do cilindro */
function createCylinderConformingPlane(width, height, radius, segments = 48) {
  const geo = new THREE.PlaneGeometry(width, height, segments, segments);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const angle = x / radius;
    pos.setX(i, Math.sin(angle) * radius);
    pos.setZ(i, (Math.cos(angle) - 1) * radius);
  }
  geo.computeVertexNormals();
  return geo;
}

/**
 * Visualizador 3D interativo com Three.js.
 * Suporta caneca (cilindro) e camiseta/moletom (extrusão com curvatura).
 * Arraste para girar 360°; rotação automática suave quando parado.
 */
export default function MockupViewer3D({ productType, designImage, productColor = 'white' }) {
  const mountRef = useRef(null);
  const animRef = useRef(null);
  const [loading, setLoading] = useState(true);

  const dragRef = useRef({ active: false, lastX: 0, velocity: 0.002, rotation: 0 });

  const colorHex = {
    white: '#f0f0f0', black: '#1a1a1a', navy: '#1e3a8a', gray: '#6b7280',
  }[productColor] || '#f0f0f0';

  const isMug = productType === 'caneca' || productType === 'caneca_termica';
  const isThermal = productType === 'caneca_termica';

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    setLoading(true);

    // --- Scene ---
    const scene = new THREE.Scene();

    // --- Camera ---
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, isMug ? 1.5 : 0.3, isThermal ? 8.5 : 7.5);
    camera.lookAt(0, 0, 0);

    // --- Renderer ---
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);
    const canvasEl = renderer.domElement;
    canvasEl.style.width = '100%';
    canvasEl.style.height = '100%';
    canvasEl.style.cursor = 'grab';
    canvasEl.style.touchAction = 'none';

    // --- Lights ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.65));
    const keyLight = new THREE.DirectionalLight(0xffffff, 0.85);
    keyLight.position.set(4, 6, 5);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0xccddff, 0.35);
    fillLight.position.set(-4, 2, 3);
    scene.add(fillLight);
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.25);
    rimLight.position.set(0, -2, -5);
    scene.add(rimLight);

    // --- Product ---
    const group = new THREE.Group();
    scene.add(group);

    const bodyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(colorHex),
      roughness: isMug ? 0.3 : 0.85,
      metalness: isMug ? 0.05 : 0.0,
      side: THREE.DoubleSide,
    });

    if (isMug) {
      const radius = isThermal ? 0.85 : 1.0;
      const height = isThermal ? 3.0 : 2.4;

      // Corpo
      const bodyGeo = new THREE.CylinderGeometry(radius, radius, height, 80, 1, true);
      group.add(new THREE.Mesh(bodyGeo, bodyMat));

      // Fundo
      const bottom = new THREE.Mesh(new THREE.CircleGeometry(radius, 80), bodyMat);
      bottom.rotation.x = Math.PI / 2;
      bottom.position.y = -height / 2;
      group.add(bottom);

      // Borda superior
      const rimMesh = new THREE.Mesh(
        new THREE.TorusGeometry(radius, 0.04, 8, 80),
        new THREE.MeshStandardMaterial({ color: '#d8d8d8', roughness: 0.3, metalness: 0.1 })
      );
      rimMesh.rotation.x = Math.PI / 2;
      rimMesh.position.y = height / 2;
      group.add(rimMesh);

      // Interior escuro
      const inner = new THREE.Mesh(
        new THREE.CylinderGeometry(radius * 0.93, radius * 0.93, height * 0.92, 64, 1, true),
        new THREE.MeshStandardMaterial({ color: '#1a1208', roughness: 0.9, side: THREE.BackSide })
      );
      group.add(inner);

      // Alça (meio toro)
      const handle = new THREE.Mesh(
        new THREE.TorusGeometry(radius * 0.55, radius * 0.11, 12, 32, Math.PI),
        bodyMat
      );
      handle.position.set(radius * 0.95, 0, 0);
      handle.rotation.set(0, Math.PI / 2, 0);
      group.add(handle);

      // Design (plano curvo na frente do cilindro)
      if (designImage) {
        new THREE.TextureLoader().load(designImage, (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          const designGeo = createCylinderConformingPlane(radius * 2.2, radius * 1.9, radius + 0.015, 48);
          group.add(new THREE.Mesh(designGeo, new THREE.MeshStandardMaterial({
            map: tex, transparent: true, roughness: 0.4, metalness: 0.05,
          })));
        }, undefined, () => {});
      }
    } else {
      // Camiseta / Moletom
      const shirtGeo = new THREE.ExtrudeGeometry(createShirtShape(), {
        depth: 0.12, bevelEnabled: true, bevelSegments: 2, bevelSize: 0.03, bevelThickness: 0.02,
      });
      shirtGeo.center();
      // Curvatura de tecido
      const pos = shirtGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const z = pos.getZ(i);
        pos.setZ(i, z - Math.pow(x / 1.5, 2) * 0.18);
      }
      shirtGeo.computeVertexNormals();
      group.add(new THREE.Mesh(shirtGeo, bodyMat));

      // Design (plano curvo no peito)
      if (designImage) {
        new THREE.TextureLoader().load(designImage, (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          const designGeo = new THREE.PlaneGeometry(1.6, 1.6, 32, 32);
          const dpos = designGeo.attributes.position;
          for (let i = 0; i < dpos.count; i++) {
            const x = dpos.getX(i);
            dpos.setZ(i, -Math.pow(x / 1.5, 2) * 0.18 + 0.15);
          }
          designGeo.computeVertexNormals();
          const designMesh = new THREE.Mesh(designGeo, new THREE.MeshStandardMaterial({
            map: tex, transparent: true, roughness: 0.7,
          }));
          designMesh.position.set(0, 0.25, 0);
          group.add(designMesh);
        }, undefined, () => {});
      }
    }

    // --- Sombra de contato ---
    const sCanvas = document.createElement('canvas');
    sCanvas.width = sCanvas.height = 256;
    const sctx = sCanvas.getContext('2d');
    const sgrad = sctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    sgrad.addColorStop(0, 'rgba(0,0,0,0.3)');
    sgrad.addColorStop(1, 'rgba(0,0,0,0)');
    sctx.fillStyle = sgrad;
    sctx.fillRect(0, 0, 256, 256);
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(4, 4),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sCanvas), transparent: true, depthWrite: false })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = isMug ? -1.4 : -2.0;
    scene.add(shadow);

    // --- Resize ---
    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (w > 0 && h > 0) {
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    // --- Drag ---
    const d = dragRef.current;
    const onDown = (e) => {
      d.active = true;
      d.lastX = e.clientX;
      canvasEl.style.cursor = 'grabbing';
      canvasEl.setPointerCapture(e.pointerId);
    };
    const onMove = (e) => {
      if (!d.active) return;
      const delta = (e.clientX - d.lastX) * 0.008;
      d.rotation += delta;
      d.velocity = delta;
      d.lastX = e.clientX;
    };
    const onUp = (e) => {
      d.active = false;
      canvasEl.style.cursor = 'grab';
      try { canvasEl.releasePointerCapture(e.pointerId); } catch {}
    };
    canvasEl.addEventListener('pointerdown', onDown);
    canvasEl.addEventListener('pointermove', onMove);
    canvasEl.addEventListener('pointerup', onUp);
    canvasEl.addEventListener('pointercancel', onUp);

    // --- Animate ---
    const animate = () => {
      animRef.current = requestAnimationFrame(animate);
      if (!d.active) {
        d.velocity *= 0.93;
        d.rotation += d.velocity;
        if (Math.abs(d.velocity) < 0.0008) d.rotation += 0.0035;
      }
      group.rotation.y = d.rotation;
      group.position.y = Math.sin(Date.now() * 0.0009) * 0.04;
      renderer.render(scene, camera);
    };
    animate();
    setLoading(false);

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
      canvasEl.removeEventListener('pointerdown', onDown);
      canvasEl.removeEventListener('pointermove', onMove);
      canvasEl.removeEventListener('pointerup', onUp);
      canvasEl.removeEventListener('pointercancel', onUp);
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => { if (m.map) m.map.dispose(); m.dispose(); });
          } else {
            if (obj.material.map) obj.material.map.dispose();
            obj.material.dispose();
          }
        }
      });
      renderer.dispose();
      if (canvasEl.parentNode) canvasEl.parentNode.removeChild(canvasEl);
    };
  }, [productType, designImage, colorHex, isMug, isThermal]);

  return (
    <div className="relative w-full h-full">
      <div ref={mountRef} className="w-full h-full" />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      )}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg pointer-events-none">
        <MoveHorizontal className="w-3.5 h-3.5 text-gray-500" />
        <span className="text-xs text-gray-600 font-medium">Arraste para girar</span>
      </div>
    </div>
  );
}