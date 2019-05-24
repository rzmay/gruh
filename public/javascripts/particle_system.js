class ParticleSystem {

    constructor(type, getMesh, killCondition) {
        this.particles = [];

        this.isSprite = type == 'sprite' ? true : false;
        this.isMesh = !this.isSprite;

        this.getMesh = getMesh;
        this.killCondition = killCondition;

        // particle = [startTime, posx, posy, posz, velx, vely, velz, rotx, roty, rotz, object]

    }

    createParticle(scene, posx, posy, posz, velx, vely, velz, rotx, roty, rotz) {
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
        return Array(global.millis, posx, posy, posz, velx || 0, vely || 0, velz ||0, rotx || 0, roty || 0, rotz || 0, mesh);

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
            if (this.killCondition(particle, self)) {
                scene.remove(this.particles[i][10]);
                this.particles.splice(i, 0);
            } else {
                this.applyParticleForces(dt, particle);
                this.adjustParticleLooks(particle);
                particle[1] += particle[4] * dt;
                particle[2] += particle[5] * dt;
                particle[3] += particle[6] * dt;

                particle[10].position.x = particle[1];
                particle[10].position.y = particle[2];
                particle[10].position.z = particle[3];

                if (this.isSprite) {
                    let material = particle[10].material;
                    material.rotation = particle[7];
                } else {
                    particle[10].rotation.x = particle[7];
                    particle[10].rotation.y = particle[8];
                    particle[10].rotation.z = particle[9];
                }
            }
        }
        // console.log(this.particles[0]);

        // this.drawParticles();
    }

    adjustParticleLooks(particle, lifetime) {}
    // specific per particle

}