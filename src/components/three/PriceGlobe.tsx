"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

interface PriceGlobeProps {
  className?: string
  size?: number
}

export function PriceGlobe({ className = "", size = 200 }: PriceGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const w = size
    const h = size

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000)
    camera.position.z = 4.5

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    const group = new THREE.Group()

    const earthGeo = new THREE.SphereGeometry(1.4, 32, 32)
    const earthMat = new THREE.MeshPhongMaterial({
      color: new THREE.Color("#1a2332"),
      emissive: new THREE.Color("#0a1628"),
      emissiveIntensity: 0.3,
      wireframe: false,
      transparent: true,
      opacity: 0.9,
    })
    const earth = new THREE.Mesh(earthGeo, earthMat)
    group.add(earth)

    const wireGeo = new THREE.SphereGeometry(1.42, 24, 16)
    const wireMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#22c55e"),
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    })
    const wireframe = new THREE.Mesh(wireGeo, wireMat)
    group.add(wireframe)

    const points: THREE.Vector3[] = []
    const colors: number[] = []

    for (let i = 0; i < 200; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 1.45 + Math.random() * 0.3

      const x = r * Math.sin(phi) * Math.cos(theta)
      const y = r * Math.sin(phi) * Math.sin(theta)
      const z = r * Math.cos(phi)

      points.push(new THREE.Vector3(x, y, z))

      const isGreen = Math.random() > 0.5
      colors.push(isGreen ? 0.13 : 0.94)
      colors.push(isGreen ? 0.77 : 0.27)
      colors.push(isGreen ? 0.4 : 0.27)
    }

    const dotGeo = new THREE.BufferGeometry()
    const dotPositions = points.flatMap((p) => [p.x, p.y, p.z])
    dotGeo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(dotPositions, 3)
    )
    const dotMat = new THREE.PointsMaterial({
      size: 0.04,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
    })
    const dotColors = new Float32Array(colors)
    dotGeo.setAttribute("color", new THREE.Float32BufferAttribute(dotColors, 3))
    const dots = new THREE.Points(dotGeo, dotMat)
    group.add(dots)

    const ringGeo = new THREE.RingGeometry(1.8, 1.85, 64)
    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#3b82f6"),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.15,
    })
    const ring = new THREE.Mesh(ringGeo, ringMat)
    ring.rotation.x = Math.PI / 3
    ring.rotation.z = Math.PI / 4
    group.add(ring)

    const ring2 = new THREE.Mesh(
      new THREE.RingGeometry(2.0, 2.03, 64),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color("#22c55e"),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.1,
      })
    )
    ring2.rotation.x = -Math.PI / 4
    ring2.rotation.z = Math.PI / 3
    group.add(ring2)

    const light = new THREE.DirectionalLight(0xffffff, 1)
    light.position.set(5, 3, 5)
    scene.add(light)

    const ambient = new THREE.AmbientLight(0x333344, 0.5)
    scene.add(ambient)

    scene.add(group)

    let mouseX = 0
    let mouseY = 0

    function onMouseMove(e: MouseEvent) {
      const rect = container!.getBoundingClientRect()
      mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1
    }
    container!.addEventListener("mousemove", onMouseMove)

    function animate() {
      requestAnimationFrame(animate)

      group.rotation.y += 0.005
      group.rotation.x += (mouseY * 0.1 - group.rotation.x) * 0.02
      group.rotation.y += (mouseX * 0.1 - group.rotation.y) * 0.005

      renderer.render(scene, camera)
    }

    animate()

    return () => {
      container.removeEventListener("mousemove", onMouseMove)
      container.removeChild(renderer.domElement)
      renderer.dispose()
    }
  }, [size])

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: size, height: size }}
    />
  )
}
