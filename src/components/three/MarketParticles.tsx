"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

interface MarketParticlesProps {
  className?: string
  count?: number
  color1?: string
  color2?: string
  speed?: number
  interactive?: boolean
}

export function MarketParticles({
  className = "",
  count = 120,
  color1 = "#22c55e",
  color2 = "#3b82f6",
  speed = 0.3,
  interactive = true,
}: MarketParticlesProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const w = container.clientWidth || window.innerWidth
    const h = container.clientHeight || window.innerHeight

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000)
    camera.position.z = 30

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    const c1 = new THREE.Color(color1)
    const c2 = new THREE.Color(color2)

    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60
      positions[i * 3 + 1] = (Math.random() - 0.5) * 40
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30

      const mix = Math.random()
      const color = c1.clone().lerp(c2, mix)
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b

      sizes[i] = Math.random() * 3 + 0.5
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1))

    const material = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    })

    const particles = new THREE.Points(geometry, material)
    scene.add(particles)

    const linesMat = new THREE.LineBasicMaterial({
      color: color1,
      transparent: true,
      opacity: 0.06,
    })

    const lines: THREE.Line[] = []
    for (let i = 0; i < 8; i++) {
      const points: THREE.Vector3[] = []
      const startIdx = Math.floor(Math.random() * count)
      const p = geometry.attributes.position
      for (let j = 0; j < 4; j++) {
        const idx = (startIdx + j * 3) % count
        points.push(
          new THREE.Vector3(p.getX(idx), p.getY(idx), p.getZ(idx))
        )
      }
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points)
      const line = new THREE.Line(lineGeo, linesMat)
      scene.add(line)
      lines.push(line)
    }

    function onMouseMove(e: MouseEvent) {
      const rect = container!.getBoundingClientRect()
      mouseRef.current = {
        x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
        y: -((e.clientY - rect.top) / rect.height) * 2 + 1,
      }
    }

    if (interactive) {
      window.addEventListener("mousemove", onMouseMove)
    }

    let time = 0

    function animate() {
      requestAnimationFrame(animate)
      time += 0.005 * speed

      const positions = geometry.attributes.position.array as Float32Array
      for (let i = 0; i < count; i++) {
        positions[i * 3 + 1] += Math.sin(time + i) * 0.002
        positions[i * 3] += Math.cos(time * 0.7 + i * 0.5) * 0.002
      }
      geometry.attributes.position.needsUpdate = true

      if (interactive) {
        particles.rotation.y += (mouseRef.current.x * 0.02 - particles.rotation.y) * 0.01
        particles.rotation.x += (mouseRef.current.y * 0.02 - particles.rotation.x) * 0.01
      } else {
        particles.rotation.y += 0.0003
        particles.rotation.x += 0.0001
      }

      lines.forEach((line, i) => {
        line.rotation.y = particles.rotation.y
        line.rotation.x = particles.rotation.x
        const mat = line.material as THREE.LineBasicMaterial
        mat.opacity = 0.04 + Math.sin(time * 0.5 + i) * 0.02
      })

      renderer.render(scene, camera)
    }

    animate()

    function onResize() {
      const c = container!
      const w2 = c.clientWidth || window.innerWidth
      const h2 = c.clientHeight || window.innerHeight
      camera.aspect = w2 / h2
      camera.updateProjectionMatrix()
      renderer.setSize(w2, h2)
    }

    window.addEventListener("resize", onResize)

    return () => {
      const c = container!
      window.removeEventListener("resize", onResize)
      if (interactive) window.removeEventListener("mousemove", onMouseMove)
      c.removeChild(renderer.domElement)
      renderer.dispose()
      geometry.dispose()
      material.dispose()
    }
  }, [count, color1, color2, speed, interactive])

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
    />
  )
}
