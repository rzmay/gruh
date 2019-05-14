class ParticleSystem {

    constructor(lifetime) {

        this.radius = .1;
        this.segments = 7;
        this.lifetime = lifetime;
        this.particles = [];

        // particle = [startTime, posx, posy, velx, vely, object]

    }

    createParticle(scene, posx, posy, velx, vely) {
        var geometry = new THREE.CircleGeometry(this.radius, this.segments);
        var material = new THREE.MeshBasicMaterial();
        material.transparent = true;
        var mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = Math.random() * 20 - 10;
        mesh.rotation.x = Math.PI/2;
        scene.add(mesh);
        return Array(global.millis, posx, posy, velx || 0, vely || 0, mesh);

        // TODO: IF WE CAN RAW DRAW 2D STUFF THIS CAN GO AND WE CAN JUST DRAW ALL THE PARTICLES IN ONE FUNC
    }

    addParticles(scene, amt, posx, posy, deviationx, deviationy, velx, vely) {
        for (let i = 0; i < amt; i++) {
            this.particles.push(this.createParticle(scene, posx + (Math.random() - .5) * deviationx, posy + (Math.random() - .5) * deviationy, velx, vely));
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
                scene.remove(this.particles[i][5]);
                this.particles.splice(i, 0);
            } else {
                this.applyParticleForces(dt, particle);
                particle[1] += particle[3] * dt;
                particle[2] += particle[4] * dt;

                particle[5].position.x = particle[1];
                particle[5].position.z = particle[2];

                this.adjustParticleLooks(particle, this.lifetime);
            }
        }
        // console.log(this.particles[0]);

        // this.drawParticles();
    }

    adjustParticleLooks(particle, lifetime) {}
    // specific per particle

}