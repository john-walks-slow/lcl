import configurations from "../configurations";
import Dialog from "./Dialog";
export default class LinkDialog extends Dialog {
  constructor(scene) {
    super(scene);
    this.link = '';
    this.select(1);
    this.dialogHeader.alpha = 0;
  }
  initializeComponents() {
    super.initializeComponents();
    this.dialogText.setText("它带着一个箱子，打开看看吗？");
    this.selectedOption = 0;
    this.dialogYes = this.scene.add.text(0, 0, " 是 ",
      {
        color: 0xFFFFFF,
        fontFamily: this.FONT_FAMILY,
      }).setInteractive();
    this.dialogYes.buttonId = "yes";
    this.dialogNo = this.scene.add.text(0, 0, " 否 ",
      {
        color: 0xFFFFFF,
        fontFamily: this.FONT_FAMILY,
      }).setInteractive();
    this.dialogNo.buttonId = "no";
    // this.dialogSelection = this.scene.add.rectangle(
    //   this.WINDOW_CENTER_X - this.WIDTH/2+this.PADDING, this.WINDOW_CENTER_Y+this.HEIGHT/2-this.FONT_SIZE_HEADER-this.PADDING_TOP,
    //   this.WIDTH/2,this.FONT_SIZE_HEADER,0x000000,0.3)
    this.add([this.dialogYes, this.dialogNo]);
    // this.showDialog('test');
  }
  setDisplay() {
    super.setDisplay();
    let c = configurations;
    Object.assign(this, c);
    this.BUTTON_SELECTED_COLOR = "#000000";
    this.WIDTH = Math.min(this.WINDOW_H / 1.5, this.WINDOW_W * 0.85);
    this.HEIGHT = this.WIDTH * 0.6;
    this.PADDING = this.WIDTH / 8;
    this.PADDING_TOP = this.WIDTH / 9;
    this.YES_X = this.WINDOW_CENTER_X - this.WIDTH / 2 + this.PADDING;
    this.YES_Y = this.WINDOW_CENTER_Y + this.HEIGHT / 2 - this.FONT_SIZE_HEADER - this.PADDING_TOP;
    this.NO_X = this.WINDOW_CENTER_X + this.PADDING;
    this.NO_Y = this.WINDOW_CENTER_Y + this.HEIGHT / 2 - this.FONT_SIZE_HEADER - this.PADDING_TOP;
    this.dialogWindow.setX(this.WINDOW_CENTER_X);
    this.dialogWindow.setY(this.WINDOW_CENTER_Y);
    this.dialogWindow.setDisplaySize(this.WIDTH, this.HEIGHT);
    this.dialogText.setX(this.WINDOW_CENTER_X - this.WIDTH / 2 + this.PADDING);
    this.dialogText.setY(this.WINDOW_CENTER_Y - this.HEIGHT / 2 + this.PADDING_TOP);
    this.dialogText.setWordWrapWidth(Math.max(this.WIDTH - this.PADDING * 2.5, this.FONT_SIZE), true);
    this.dialogYes.setX(this.YES_X);
    this.dialogYes.setY(this.YES_Y);
    this.dialogYes.setStyle({
      color: 0xFFFFFF,
      fontFamily: this.FONT_FAMILY,
      fontSize: `${this.FONT_SIZE}px`,
    });
    this.dialogNo.setX(this.NO_X);
    this.dialogNo.setY(this.NO_Y);
    this.dialogNo.setStyle({
      color: 0xFFFFFF,
      fontFamily: this.FONT_FAMILY,
      fontSize: `${this.FONT_SIZE}px`,
    });
    this.dialogNo.setX;
  }
  select(i) {
    this.selectedOption = i;
    [this.dialogYes, this.dialogNo][i].setBackgroundColor(this.BUTTON_SELECTED_COLOR).setColor("#FFFFFF");
    [this.dialogYes, this.dialogNo][1 - i].setBackgroundColor("").setColor("#000000");
  }
  setHttp(link) {
    if (link.search(/^http[s]?\:\/\//) == -1) {
      link = 'http://' + link;
    }
    return link;
  }
  confirm() {
    console.log(this.link);
    this.scene.input.keyboard.off('keydown-LEFT');
    this.scene.input.keyboard.off('keydown-RIGHT');
    this.scene.input.keyboard.off('keydown-SPACE');
    this.scene.input.off('gameobjectover');
    this.scene.input.off('gameobjectup');

    if (this.selectedOption == 0) {
      this.alpha = 0;
      window.open(this.setHttp(this.link));
    } else {
      this.dialogFadeOut.play().on('complete', () => {
      });

    }
    this.scene.gamepad.show();
    this.inDialog = false;
    this.select(1);
    this.link = "";
  }

  showDialog(link) {
    console.log('show link');
    this.scene.gamepad.hide();
    this.link = link;
    this.inDialog = true;
    this.scene.input.on('gameobjectover', (pointer, o, event) => {
      if (o.buttonId == "yes") { this.select(0); }
      if (o.buttonId == "no") { this.select(1); }
    });
    this.scene.input.on('gameobjectup', (pointer, o, event) => {
      this.confirm();
    });
    this.scene.input.keyboard.on('keydown-LEFT', () => { this.select(0); });
    this.scene.input.keyboard.on('keydown-RIGHT', () => { this.select(1); });
    this.scene.input.keyboard.on('keydown-SPACE', () => { this.confirm(); });
    this.dialogFadeIn.play();
  }
}
