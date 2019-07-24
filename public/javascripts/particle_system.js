class ParticleSystem {

    constructor(type, getMesh, killCondition, updateWhileInactive=true) {
        this.particles = [];

        this.isSprite = (type === 'sprite');
        this.isMesh = !this.isSprite;

        this.getMesh = getMesh;
        this.killCondition = killCondition;

        this.updateWhileInactive = updateWhileInactive;

        this.windowIsActive = true;

        // Set up window activity detection
        $(window).focus(function() {
            self.windowIsActive = true;
        });

        $(window).blur(function() {
            self.windowIsActive = false;
        });
    }

    createParticle(scene, posx, posy, posz, velx, vely, velz, rotx, roty, rotz, options) {
        var mesh = this.getMesh();

        mesh.position.x = posx;
        mesh.position.y = posy;
        mesh.position.z = posz;

        if (this.isSprite) {
            let material = mesh.material;
            material.rotation = rotx;
        } else {
            mesh.rotation.x = rotx;
            mesh.rotation.y = roty;
            mesh.rotation.z = rotz;
        }

        scene.add(mesh);

        return new Particle(
          new THREE.Vector3(posx || 0, posy || 0, posz || 0),
          new THREE.Vector3(velx || 0, vely || 0, velz || 0),
          new THREE.Vector3(rotx || 0, roty || 0, rotz || 0),
          global.millis,
          mesh,
          options,
          this.isSprite
        );

        // TODO: IF WE CAN RAW DRAW 2D STUFF THIS CAN GO AND WE CAN JUST DRAW ALL THE PARTICLES IN ONE FUNC
    }

    getNewParticle(createParticle) { }

    addParticles(scene, amt) {
        for (let i = 0; i < amt; i++) {
            let self = this;
            this.getNewParticle((params)=> {
                self.particles.push(self.createParticle(
                  scene,
                  params.posx,
                  params.posy,
                  params.posz,
                  params.velx,
                  params.vely,
                  params.velz,
                  params.rotx,
                  params.roty,
                  params.rotz,
                  params.options
                ));
            })
        }
    }

    setSpawnInterval(scene, amount, time) {
        let self = this;
        return setInterval(()=>{
            self.spawn(scene, amount);
        }, time);
    }

    spawn(scene, amount) {
        // If inactive and updateWhileInactive is disabled, return
        if (!this.updateWhileInactive && !this.windowIsActive) { return }
        if (global.particleCount < global.maxParticles) {
            this.addParticles(scene, amount);
            global.particleCount += 1;
        }
    }

    updateParticles(millis, dt, scene) {
        // If inactive and updateWhileInactive is disabled, return
        if (!this.updateWhileInactive && !this.windowIsActive) { return }

        // If there are no particles to update, return
        if (this.particles.length < 1) { return }

        for (let i = this.particles.length - 1; i >= 0; i--) {
            let particle = this.particles[i];
            if (this.killCondition(particle, self)) {
                this.onParticleKill(particle);
                scene.remove(this.particles[i].mesh);
                this.particles.splice(i, 1);
                global.particleCount -= 1;
            } else {
                this.applyParticleForces(dt, particle);
                this.adjustParticleLooks(particle);
                particle.move(dt);
            }
        }
        // console.log(this.particles[0]);

        // this.drawParticles();
    }

    adjustParticleLooks(particle, lifetime) {}
    // specific per particle

    applyParticleForces(dt, particle) {}
    // specific per particle system, including drag

    onParticleKill(particle) {}
    // specific per particle system
}