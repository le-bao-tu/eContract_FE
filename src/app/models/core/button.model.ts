export class ButtonModel {
  title?: string | undefined;
  titlei18n?: string | undefined;
  visible = true;
  enable = true;
  grandAccess = true;
  isLoading? = false;
  click!: ($event: any) => any;
}
