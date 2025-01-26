let damageIndicators = [];

function detectCollisions() {
  // Check if bullets hit enemies
  // Preload the collision sound
  const enemycollisionSound = new Audio("collision-sound.mp3");
  enemycollisionSound.volume = 0.2; // Set the volume to 20%

  for (let i = 0; i < bullets.length; i++) {
    for (let j = 0; j < enemies.length; j++) {
      if (
        bullets[i].x < enemies[j].x + enemies[j].width &&
        bullets[i].x + bullets[i].width > enemies[j].x &&
        bullets[i].y < enemies[j].y + enemies[j].height &&
        bullets[i].y + bullets[i].height > enemies[j].y
      ) {
        // Calculate the distance between the bullet and the enemy
        const distance = Math.sqrt(
          (enemies[j].x - bullets[i].x) ** 2 + (enemies[j].y - bullets[i].y) ** 2
        );

        let damageModifier = 1; // Default modifier is 1 (no change)

        if (distance > 100) {
          // Example threshold for long distance
          damageModifier = 0.5; // Decrease damage by 50%
        } else if (distance < 50) {
          // Example threshold for short distance
          damageModifier = 1.2; // Increase damage by 20%
        }

        const modifiedDamage = bullets[i].damage * damageModifier;
        enemies[j].health -= modifiedDamage;

        // Create a floating damage indicator
        damageIndicators.push({
          x: enemies[j].x + enemies[j].width / 2,
          y: enemies[j].y + enemies[j].height / 2,
          text: modifiedDamage.toFixed(2), // Show the modified damage
          lifetime: 30, // How long the indicator lasts
          color: getRandomColor(), // Assign a random color
        });

        // If the enemy's health is less than or equal to 0, remove it
        if (enemies[j].health <= 0) {
          enemies.splice(j, 1);
          score += 10; // Increment the score
          coins += 1; // Increment coins by 1 for each enemy destroyed
          j--; // Adjust index after removal
        }

        // Play the collision sound when a bullet hits an enemy
        enemycollisionSound.play();

        // Remove the bullet after collision
        bullets.splice(i, 1);
        i--; // Adjust index after removal
        break;
      }
    }
  }

  // Preload the collision sound
  const collisionSound = new Audio("collision-sound.mp3");
  collisionSound.volume = 0.2; // Set the volume to 20%

  for (let i = 0; i < enemies.length; i++) {
    // Check for collision with the player
    if (
      player.x < enemies[i].x + enemies[i].width &&
      player.x + player.width > enemies[i].x &&
      player.y < enemies[i].y + enemies[i].height &&
      player.y + player.height > enemies[i].y
    ) {
      let damage = 2; // Default base damage value

      // Check for specific enemy colors and set damage accordingly
      if (enemies[i].color === "grey") {
        damage = 3; // Big grey enemy deals 3 damage

      } else if (enemies[i].color === "white") {
        damage = 4; // White enemies deal 4 damage
      } else if (enemies[i].color === "silver") {
        damage = 6; // Silver enemies deal 6 damage
      } else if (enemies[i].color === "purple") {
        damage = 8; // Purple enemies deal 8 damage
      } else {
        damage = 2; // Regular enemies default to 2 damage
      }

      // Calculate critical hit with a 25% chance
      const critChance = Math.random() * 100; // Random number between 0 and 100
      if (critChance < 25) {
        damage *= 2; // Double the damage for a critical hit
      }

      // Reduce player health when hit by enemy
      player.health -= damage;

      // Trigger damage effect for the player
      triggerDamageEffect();

      // Create a floating damage indicator for the player
      damageIndicators.push({
        x: player.x + player.width / 2,
        y: player.y + player.height / 2,
        text: damage, // Updated damage value (critical or base)
        lifetime: 30,
        color: getRandomColor(),
      });

      // Play the collision sound
      collisionSound.play();

      // Remove enemy when it hits the player
      enemies.splice(i, 1);
      i--; // Adjust index after removal
    }
  }

  // Check if bomb explosion hits enemies
  const currentTime = Date.now();
  if (currentTime - lastBombTime < 200) {
    // Check if the bomb is still "active"
    for (let i = 0; i < enemies.length; i++) {
      const enemy = enemies[i];
      const distance = Math.sqrt(
        Math.pow(player.x + player.width / 2 - (enemy.x + enemy.width / 2), 2) +
          Math.pow(
            player.y + player.height / 2 - (enemy.y + enemy.height / 2),
            2
          )
      );

      if (distance <= bombEffectRadius) {
        // Apply bomb damage to the enemy
        enemy.health -= 7.0;

        // Create a floating damage indicator for the bomb
        damageIndicators.push({
          x: enemy.x + enemy.width / 2,
          y: enemy.y + enemy.height / 2,
          text: 7, // bomb damage
          lifetime: 30,
        });

        // If the enemy's health is less than or equal to 0, remove it
        if (enemy.health <= 0) {
          enemies.splice(i, 1);
          score += 10; // Increment the score
          coins += 1; // Increment coins
          i--; // Adjust index after removal
        }
      }
    }

    for (let i = 0; i < bullets.length; i++) {
      for (let j = 0; j < enemies.length; j++) {
        if (
          bullets[i].x < enemies[j].x + enemies[j].width &&
          bullets[i].x + bullets[i].width > enemies[j].x &&
          bullets[i].y < enemies[j].y + enemies[j].height &&
          bullets[i].y + bullets[i].height > enemies[j].y
        ) {
          // Apply initial bullet damage to the enemy
          enemies[j].health -= bullets[i].damage;

          // Check if this is an ice gun bullet
          if (bullets[i].type === "ice") {
            // Apply slowdown effect to the enemy (e.g., reduce speed)
            enemies[j].speed *= iceGunSlowdownEffect; // Reduce enemy speed by 50%

            // Optional: Create a visual effect to indicate slowdown
            damageIndicators.push({
              x: enemies[j].x + enemies[j].width / 2,
              y: enemies[j].y + enemies[j].height / 2,
              text: "Frozen", // Indicate that the enemy is frozen
              lifetime: 30,
              color: "blue", // Blue for ice
            });
          }

          // Remove the bullet after collision
          bullets.splice(i, 1);
          i--; // Adjust index after removal
          break;
        }
      }
    }
  }

  // Update floating damage indicators (move them upwards and reduce their lifetime)
  for (let i = 0; i < damageIndicators.length; i++) {
    damageIndicators[i].y -= 1; // Move the indicator upwards
    damageIndicators[i].lifetime--; // Decrease lifetime
    if (damageIndicators[i].lifetime <= 0) {
      damageIndicators.splice(i, 1); // Remove the indicator once its lifetime is over
      i--; // Adjust index after removal
    }
  }
}

const enemycollisionSound = new Audio("collision-sound.mp3");
enemycollisionSound.volume = 0.2; // Set the volume to full (equivalent to 10 on a 0-10 scale)

// Missile collision logic
function checkMissileCollisions() {
  for (let i = 0; i < missiles.length; i++) {
    for (let j = 0; j < enemies.length; j++) {
      if (
        missiles[i].x < enemies[j].x + enemies[j].width &&
        missiles[i].x + missiles[i].width > enemies[j].x &&
        missiles[i].y < enemies[j].y + enemies[j].height &&
        missiles[i].y + missiles[i].height > enemies[j].y
      ) {
        // Apply missile damage to the enemy
        enemies[j].health -= missiles[i].damage;

        // Create a floating damage indicator
        damageIndicators.push({
          x: enemies[j].x + enemies[j].width / 2,
          y: enemies[j].y + enemies[j].height / 2,
          text: missiles[i].damage,
          lifetime: 30, // How long the indicator lasts
          color: getRandomColor(), // Assign a random color
        });

        // If the enemy's health is less than or equal to 0, remove it
        if (enemies[j].health <= 0) {
          enemies.splice(j, 1);
          score += 20; // Increment the score
          coins += 9; // Increment coins by 1 for each enemy destroyed
          j--; // Adjust index after removal
        }

        // Play the collision sound when a missile hits an enemy
        enemycollisionSound.play();

        // Remove the missile after collision
        missiles.splice(i, 1);
        i--; // Adjust index after removal
        break;
      }
    }
  }
}

function getRandomColor() {
  const colors = [
    { color: "red", weight: 25 },
    { color: "orange", weight: 13 },
    { color: "yellow", weight: 14 },
    { color: "#FFFFE0", weight: 25 }, // Light yellow
    { color: "#FFA07A", weight: 33 }, // Light orange
  ];

  const totalWeight = colors.reduce((sum, entry) => sum + entry.weight, 0);
  const randomNum = Math.random() * totalWeight;

  let cumulativeWeight = 0;
  for (const entry of colors) {
    cumulativeWeight += entry.weight;
    if (randomNum <= cumulativeWeight) {
      return entry.color;
    }
  }
}

// Function to draw the damage indicators
function drawDamageIndicators() {
  for (let i = 0; i < damageIndicators.length; i++) {
    ctx.fillStyle = damageIndicators[i].color; // Use the assigned color
    ctx.font = "20px Arial";
    ctx.fillText(
      damageIndicators[i].text,
      damageIndicators[i].x,
      damageIndicators[i].y
    );
  }
}

const icecollisionSound = new Audio("Collision Sound Effect.mp3"); // Load the collision sound file

const damageSound = new Audio("Damage Sound Effect.mp3"); // Load the damage sound file

function detectIceBulletCollisions(enemies) {
  for (let i = 0; i < iceBullets.length; i++) {
    for (let j = 0; j < enemies.length; j++) {
      const bullet = iceBullets[i];
      const enemy = enemies[j];

      // Collision detection logic
      if (
        bullet.x < enemy.x + enemy.width &&
        bullet.x + bullet.width > enemy.x &&
        bullet.y < enemy.y + enemy.height &&
        bullet.y + bullet.height > enemy.y
      ) {
        // Collision detected, apply base damage
        enemy.health -= bullet.damage;

        // Apply incremental damage and effects from the ice bullet
        applyIceEffect(enemy, bullet);

        // Show ice damage indicator
        // (Assuming you have a function for this)

        // Show the numerical damage indicator
        showDamageNumber(enemy, bullet.damage);

        // Play the collision sound
        icecollisionSound.play();

        // play damage sound
        damageSound.play();

        // Check if the enemy's health is 0 or below, and remove them from the array
        if (enemy.health <= 0) {
          // Remove the enemy from the enemies array
          enemies.splice(j, 1);
          j--; // Adjust index due to removal of the enemy

          // Increment score and coins
          score += 30; // Add 30 points for defeating the enemy
          coins += 8; // Add 8 coins for defeating the enemy
        }

        // Remove the ice bullet after hit
        iceBullets.splice(i, 1);
        i--; // Adjust index due to removal of the bullet
        break; // Exit the loop once the bullet collides with an enemy
      }
    }
  }
}

let indicators = [];

// Function to show numerical damage indicator
function showDamageNumber(enemy, damage) {
  // Remove any previous damage indicators for this enemy
  indicators = indicators.filter((indicator) => !(indicator.enemy === enemy));

  // Create a new damage number indicator object
  const damageNumber = {
    enemy: enemy, // Store the enemy reference to identify and replace later
    x: enemy.x + enemy.width / 2, // Position at the center of the enemy
    y: enemy.y - 30, // Slightly above the enemy
    text: `-${damage}`, // Show the numerical damage amount
    color: "#C2DFE1", // Color of the damage number
    size: 24, // Updated text size for the damage number (22px)
    duration: 1.0, // Duration for the effect in seconds
  };

  // Push the damage number to the indicators array
  indicators.push(damageNumber);

  // Remove the damage number after the specified duration
  setTimeout(() => {
    const index = indicators.indexOf(damageNumber);
    if (index > -1) {
      indicators.splice(index, 1); // Remove the damage number after duration
    }
  }, damageNumber.duration * 1000);
}

// Function to render the indicators (e.g., on a canvas)
function renderIndicators(ctx) {
  // Loop through all active indicators and render them
  for (const indicator of indicators) {
    ctx.fillStyle = indicator.color;
    ctx.font = `${indicator.size}px Arial`; // Use the updated size here
    ctx.fillText(indicator.text, indicator.x, indicator.y);

    // Animate the indicator's movement (e.g., move it upwards and fade out)
    indicator.y -= 2; // Move upward
    indicator.size *= 0.98; // Fade text by shrinking font size (optional)
  }
}
