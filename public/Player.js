class Player {
  WALK_ANIMATION_TIMER = 200;
  walkAnimationTimer = this.WALK_ANIMATION_TIMER;

  dinoRunImages = [];
  charRunImages = [];

  //점프 상태값
  jumpPressed = false;
  jumpInProgress = false;
  falling = false;

  JUMP_SPEED = 0.6;
  GRAVITY = 0.4;
  isPoision = null;
  image = null;

  save = null;
  saveGravity = this.GRAVITY;

  // 생성자
  constructor(ctx, width, height, minJumpHeight, maxJumpHeight, scaleRatio) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.width = Math.floor(width);
    this.height = Math.floor(height);
    this.minJumpHeight = Math.floor(minJumpHeight);
    this.maxJumpHeight = Math.floor(maxJumpHeight);
    this.scaleRatio = scaleRatio;
    this.isPoision = false;

    this.save = { width, height, minJumpHeight, maxJumpHeight };
    this.x = 10 * scaleRatio;
    this.y = this.canvas.height - this.height - 1.5 * scaleRatio;
    // 기본 위치 상수화
    this.yStandingPosition = this.y;

    this.standingStillImage = new Image();
    this.standingStillImage.src = "images/characters/sample3.png";
    this.image = this.standingStillImage;

    // 캐릭터 이미지들 불러오기
    const charRunImage1 = new Image();
    charRunImage1.src = "images/characters/sample1.png";

    const charRunImage2 = new Image();
    charRunImage2.src = "images/characters/sample2.png";

    const charRunImage3 = new Image();
    charRunImage3.src = "images/characters/sample3.png";

    const charRunImage4 = new Image();
    charRunImage4.src = "images/characters/sample4.png";

    const charRunImage5 = new Image();
    charRunImage5.src = "images/characters/sample5.png";

    const charRunImage6 = new Image();
    charRunImage6.src = "images/characters/sample6.png";

    const charRunImage7 = new Image();
    charRunImage7.src = "images/characters/sample7.png";

    this.charRunImages.push(charRunImage1);
    this.charRunImages.push(charRunImage2);
    this.charRunImages.push(charRunImage3);
    this.charRunImages.push(charRunImage4);
    this.charRunImages.push(charRunImage5);
    this.charRunImages.push(charRunImage6);
    this.charRunImages.push(charRunImage7);

    // 키보드 설정
    // 등록된 이벤트가 있는 경우 삭제하고 다시 등록
    window.removeEventListener("keydown", this.keydown);
    window.removeEventListener("keyup", this.keyup);

    window.addEventListener("keydown", this.keydown);
    window.addEventListener("keyup", this.keyup);
  }

  keydown = (event) => {
    if (event.code === "Space") {
      this.jumpPressed = true;
      //console.log('press');
    }
  };

  keyup = (event) => {
    if (event.code === "Space") {
      this.jumpPressed = false;
    }
  };

  update(gameSpeed, deltaTime) {
    this.run(gameSpeed, deltaTime);

    if (this.jumpInProgress) {
      this.image = this.standingStillImage;
    }

    this.jump(deltaTime);
  }

  jump(deltaTime) {
    if (this.jumpPressed) {
      this.jumpInProgress = true;
    }

    // 점프가 진행중이고 떨어지는중이 아닐때
    if (this.jumpInProgress && !this.falling) {
      // 현재 인스턴스의 위치가 점프의 최소, 최대값의 사이일때
      if (
        this.y > this.canvas.height - this.minJumpHeight ||
        (this.y > this.canvas.height - this.maxJumpHeight && this.jumpPressed)
      ) {
        // 아무튼 위의 내용은 버튼을 눌렀을때 올라가는 조건
        this.y -= this.JUMP_SPEED * deltaTime * this.scaleRatio;
      } else {
        this.falling = true;
      }
      // 떨어질 때
    } else {
      if (this.y < this.yStandingPosition) {
        this.y += this.GRAVITY * deltaTime * this.scaleRatio;

        // 혹시 위치가 어긋 났을때 원래 위치로
        if (this.y + this.height > this.canvas.height) {
          this.y = this.yStandingPosition;
        }
      } else {
        this.falling = false;
        this.jumpInProgress = false;
      }
    }
  }

  run(gameSpeed, deltaTime) {
    // walkTimer 가 0보다 작아질 때마다 현재 실행되는 이미지를 가져와서 다음 이미지를 출력한다.
    // 이미지는 총 7개가 있고 해당 이미지의 번수가 7보다 커질 경우에는 %7로 돌아온다.
    if (
      this.walkAnimationTimer >= 0 &&
      Math.floor(this.walkAnimationTimer) % 4 === 0
    ) {
      const saveRunImageIndex = this.charRunImages.indexOf(this.image);

      this.image = this.charRunImages[(saveRunImageIndex + 1) % 7];
    }

    this.walkAnimationTimer += deltaTime * gameSpeed;
  }

  draw() {
    this.ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
  }

  reset() {
    this.width = this.save.width;
    this.height = this.save.height;
    this.minJumpHeight = this.save.minJumpHeight;
    this.maxJumpHeight = this.save.maxJumpHeight;
    this.GRAVITY = this.saveGravity;
  }
}

export default Player;
