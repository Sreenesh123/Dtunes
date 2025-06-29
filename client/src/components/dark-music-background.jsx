+"use client"

import React, { useEffect, useRef } from "react"

const DarkMusicBackground = () => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles = []
    const musicNotes = []
    const soundWaves = []
    const vinylRecords = []
    const blobs = [] 

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 3 + 1
        this.speedX = Math.random() * 3 - 1.5
        this.speedY = Math.random() * 3 - 1.5
        this.color = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${
          Math.random() * 255
        }, ${Math.random() * 0.5 + 0.5})`
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY

        if (this.size > 0.2) this.size -= 0.1

        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1
      }

      draw() {
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    class MusicNote {
      constructor() {
        this.x = Math.random() * canvas.width
        this.y = canvas.height + 100
        this.size = Math.random() * 20 + 10
        this.color = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${
          Math.random() * 255
        }, ${Math.random() * 0.5 + 0.5})`
        this.angle = Math.random() * 6.28
        this.velocity = Math.random() * 2 + 1
      }

      update() {
        this.y -= this.velocity
        this.x += Math.sin(this.angle) * 2
        this.angle += 0.05

        if (this.y < -100) {
          this.y = canvas.height + 100
          this.x = Math.random() * canvas.width
        }
      }

      draw() {
        ctx.save()
        ctx.translate(this.x, this.y)
        ctx.rotate(this.angle)
        ctx.fillStyle = this.color
        ctx.font = `${this.size}px Arial`
        ctx.fillText("♪", 0, 0)
        ctx.restore()
      }
    }

    class SoundWave {
      constructor() {
        this.x = Math.random() * canvas.width
        this.y = canvas.height / 2
        this.amplitude = Math.random() * 50 + 20
        this.frequency = Math.random() * 0.02 + 0.01
        this.color = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${
          Math.random() * 255
        }, ${Math.random() * 0.5 + 0.5})`
        this.phase = 0
      }

      update() {
        this.phase += 0.05
      }

      draw() {
        ctx.beginPath()
        ctx.moveTo(0, this.y)
        for (let i = 0; i < canvas.width; i++) {
          const y = this.y + Math.sin(i * this.frequency + this.phase) * this.amplitude
          ctx.lineTo(i, y)
        }
        ctx.strokeStyle = this.color
        ctx.lineWidth = 2
        ctx.stroke()
      }
    }

    class VinylRecord {
      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.radius = Math.random() * 50 + 50
        this.angle = 0
        this.speed = Math.random() * 0.02 + 0.01
      }

      update() {
        this.angle += this.speed
      }

      draw() {
        ctx.save()
        ctx.translate(this.x, this.y)
        ctx.rotate(this.angle)
        ctx.beginPath()
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${
          Math.random() * 255
        }, 0.8)`
        ctx.lineWidth = 5
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(0, 0, this.radius * 0.3, 0, Math.PI * 2)
        ctx.stroke()
        ctx.restore()
      }
    }

    class Blob {
      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.radius = Math.random() * 100 + 50
        this.color = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${
          Math.random() * 255
        }, ${Math.random() * 0.2 + 0.1})` 
        this.speedX = Math.random() * 2 - 1
        this.speedY = Math.random() * 2 - 1
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY

        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1
      }

      draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.fill()
      }
    }

    function createParticles(amount) {
      for (let i = 0; i < amount; i++) {
        particles.push(new Particle())
      }
    }

    function createMusicNotes(amount) {
      for (let i = 0; i < amount; i++) {
        musicNotes.push(new MusicNote())
      }
    }

    function createSoundWaves(amount) {
      for (let i = 0; i < amount; i++) {
        soundWaves.push(new SoundWave())
      }
    }

    function createVinylRecords(amount) {
      for (let i = 0; i < amount; i++) {
        vinylRecords.push(new VinylRecord())
      }
    }

    function createBlobs(amount) {
      for (let i = 0; i < amount; i++) {
        blobs.push(new Blob())
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      blobs.forEach((blob) => {
        blob.update()
        blob.draw()
      })

      particles.forEach((particle) => {
        particle.update()
        particle.draw()
      })

      musicNotes.forEach((note) => {
        note.update()
        note.draw()
      })

      soundWaves.forEach((wave) => {
        wave.update()
        wave.draw()
      })

      vinylRecords.forEach((record) => {
        record.update()
        record.draw()
      })

      requestAnimationFrame(animate)
    }

    createParticles(100)
    createMusicNotes(10)
    createSoundWaves(3)
    createVinylRecords(5)
    createBlobs(5) 
    animate()
    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full z-0"
      style={{ position: "fixed", top: 0, left: 0 }}
    />
  )
}

export default DarkMusicBackground