class ParticleSystem {

    constructor(lifetime, getMesh) {
        this.lifetime = lifetime;
        this.particles = [];

        this.getMesh = getMesh;

        // particle = [startTime, posx, posy, posz, velx, vely, velz, rotx, roty, rotz, object]

    }

    createParticle(scene, posx, posy, posz, velx, vely, velz, rotx, roty, rotz) {
        var mesh = this.getMesh();

        // position y = vel z; y is up
        mesh.position.y = posz;
        mesh.rotation.x = Math.PI/2;
        scene.add(mesh);
        return Array(global.millis, posx, posy, mesh.position.y, velx || 0, vely || 0, velz ||0, rotx || 0, roty || 0, rotz || 0, mesh);

        // TODO: IF WE CAN RAW DRAW 2D STUFF THIS CAN GO AND WE CAN JUST DRAW ALL THE PARTICLES IN ONE FUNC
    }

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
                ));
            })
        }
    }

    // setSpawnInterval(amt, interval, posx, posy, deviationx, deviationy, velx, vely) {
    // 	window.setInterval(function() {
    // 		this.addParticles(amt, posx, posy, deviationx || 0, deviationy || 0, velx || 0, vely || 0);
    // 	}, interval);
    // }

    applyParticleForces(dt, particle) {}
    // specific per particle system, including drag

    updateParticles(millis, dt, scene) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            let particle = this.particles[i];
            if (millis - particle[0] > this.lifetime) {
                scene.remove(this.particles[i][6]);
                this.particles.splice(i, 0);
            } else {
                this.applyParticleForces(dt, particle);
                particle[1] += particle[4] * dt;
                particle[2] += particle[5] * dt;

                particle[10].position.x = particle[1];
                particle[10].position.z = particle[2];

                this.adjustParticleLooks(particle, this.lifetime);
            }
        }
        // console.log(this.particles[0]);

        // this.drawParticles();
    }

    adjustParticleLooks(particle, lifetime) {}
    // specific per particle

}