import Dialog from "./Dialog";

export default class LinkDialog extends Dialog {
  constructor(scene, configurations) {
    super(scene);
    Object.assign(this, configurations);
    const width = Math.min(this.WINDOW_H / 1.5, this.WINDOW_W * 0.85);
    const height = width * 0.6;
    const padding = width / 8;
    const paddingTop = width / 9;
    this.link = '';
    this.buttonSelected = "#222034";
    this.dialogWindow.setX(this.WINDOW_CENTER_X);
    this.dialogWindow.setY(this.WINDOW_CENTER_Y);
    this.dialogWindow.setDisplaySize(width, height);
    this.dialogText.setText("它带着一个箱子，打开看看吗？");
    this.dialogText.setX(this.WINDOW_CENTER_X - width / 2 + padding);
    this.dialogText.setY(this.WINDOW_CENTER_Y - height / 2 + paddingTop);
    this.dialogText.setWordWrapWidth(width - padding * 2.5, true);
    this.selectedOption = 0;
    this.dialogYes = this.scene.add.text(this.WINDOW_CENTER_X - width / 2 + padding, this.WINDOW_CENTER_Y + height / 2 - this.FONT_SIZE_HEADER - paddingTop, " 是 ",
      {
        color: 0xFFFFFF,
        fontFamily: this.FONT_FAMILY,
        fontSize: (this.FONT_SIZE_HEADER).toString() + "px",
      }).setInteractive();
    this.dialogYes.buttonId = "yes";
    this.dialogNo = this.scene.add.text(this.WINDOW_CENTER_X + padding, this.WINDOW_CENTER_Y + height / 2 - this.FONT_SIZE_HEADER - paddingTop, " 否 ",
      {
        color: 0xFFFFFF,
        fontFamily: this.FONT_FAMILY,
        fontSize: (this.FONT_SIZE_HEADER).toString() + "px",
      }).setInteractive();
    this.dialogNo.buttonId = "no";
    // this.dialogSelection = this.scene.add.rectangle(
    //   this.WINDOW_CENTER_X - width/2+padding, this.WINDOW_CENTER_Y+height/2-this.FONT_SIZE_HEADER-paddingTop,
    //   width/2,this.FONT_SIZE_HEADER,0x222034,0.3)
    this.add([this.dialogYes, this.dialogNo]);
    this.select(1);

  }
  select(i) {
    this.selectedOption = i;
    [this.dialogYes, this.dialogNo][i].setBackgroundColor(this.buttonSelected).setColor("#FFFFFF");
    [this.dialogYes, this.dialogNo][1 - i].setBackgroundColor("").setColor("#222034");
  }
  confirm() {
    console.log(this.link);
    if (this.link.length > 0 && this.selectedOption == 0) {
      window.open(this.link);
    }
    this.scene.input.keyboard.off('keydown-LEFT');
    this.scene.input.keyboard.off('keydown-RIGHT');
    this.scene.input.keyboard.off('keydown-SPACE');
    this.scene.input.off('gameobjectdown');
    this.select(1);
    this.dialogFadeOut.play().on('complete', () => {
      this.inDialog = false;
    });
    this.link = "";
  }

  showDialog(link) {
    console.log('show link');
    this.link = link;
    this.inDialog = true;
    this.scene.input.on('gameobjectdown', (pointer, o, event) => {
      console.log(o);
      if (o.buttonId == "yes") { this.select(0); }
      if (o.buttonId == "no") { this.select(1); }
      this.confirm();
    });
    this.scene.input.keyboard.on('keydown-LEFT', () => { this.select(0); });
    this.scene.input.keyboard.on('keydown-RIGHT', () => { this.select(1); });
    this.scene.input.keyboard.on('keydown-SPACE', () => { this.confirm(); });
    this.dialogFadeIn.play();
  }
}
