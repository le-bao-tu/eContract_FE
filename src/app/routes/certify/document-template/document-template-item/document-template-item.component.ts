import { ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { I18NService } from '@core';
import { ACLService } from '@delon/acl';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ALAIN_I18N_TOKEN, SettingsService } from '@delon/theme';
import { environment } from '@env/environment';
import { ButtonModel } from '@model';
import { CertifyTypeApiService, DocumentTemplateApiService, InfoInCertifyApiService } from '@service';
import { cleanForm, getUrlDownloadFile, nodeUploadRouter, REGEX_CODE, REGEX_NAME } from '@util';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { Subscription } from 'rxjs';
import moment from 'moment';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-document-template-item',
  templateUrl: './document-template-item.component.html',
  styleUrls: ['./document-template-item.component.less'],
})
export class DocumentTemplateItemComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private messageService: NzMessageService,
    private certifyTypeApiService: CertifyTypeApiService,
    private infoInCertifyApiService: InfoInCertifyApiService,
    private documentTemplateApiService: DocumentTemplateApiService,
    private aclService: ACLService,
    private cdr: ChangeDetectorRef,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
  ) {
    const token = tokenService.get()?.token;
    if (token) {
      this.headerUploadFile = {
        Authorization: 'Bearer ' + token,
      };
    }
    this.btnSave = {
      title: 'Lưu',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-save.label')}`,
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.save();
      },
    };
    this.btnSaveAndCreate = {
      title: 'Lưu & Thêm mới',
      titlei18n: '',
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.save(true);
      },
    };
    this.btnCancel = {
      title: 'Đóng',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-cancel.label')}`,
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.handleCancel();
      },
    };
    this.btnEdit = {
      title: 'Cập nhật',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-edit.label')}`,
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.updateFormToEdit();
      },
    };
    this.btnConfigTemplate = {
      title: 'Cấu hình biểu mẫu',
      titlei18n: `${this.i18n.fanyi('function.document-template.document-template-config.button')}`,
      visible: false,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        window.open(`/certify/document-template-config/${this.item.id}`, '_blank');
      },
    };
    this.form = this.fb.group({
      code: [{ value: null, disabled: !this.isAdd }, [Validators.required, Validators.pattern(this.regexCode)]],
      name: [null, [Validators.required, Validators.pattern(this.regexName)]],
      order: [null],
      status: [{ value: true, disabled: this.isInfo }],
      description: [null],
      documentType: [null, [Validators.required]],
      documentMetaData: [null],
      dateTimeValid: [null],
    });
  }
  @Input() type = 'add';
  @Input() item: any;
  @Input() isVisible = false;
  @Input() option: any;
  @Output() eventEmmit = new EventEmitter<any>();

  form: FormGroup;
  moduleName = 'biểu mẫu';

  isInfo = false;
  isEdit = false;
  isAdd = false;
  tittle = '';
  regexCode = REGEX_CODE;
  regexName = REGEX_NAME;

  documentTemplate: any = {
    id: null,
    code: null,
    name: null,
    documentTypeId: null,
    documentTypeName: null,
    description: null,
    status: true,
    documentFileTemplate: [
      {
        id: null,
        fileName: null,
        fileUrl: null,
        filePath: null,
        profileName: null,
        metaDataConfig: [],
      },
    ],
    documentMetaDataConfig: [],
    order: 0,
  };

  isLoading = false;
  isReloadGrid = false;

  fileList: NzUploadFile[] = [];
  uploadFile: any = {
    id: undefined,
    uid: null,
    name: null,
    status: 'done',
    url: null,
    filename: null,
  };

  btnSave: ButtonModel;
  btnSaveAndCreate: ButtonModel;
  btnCancel: ButtonModel;
  btnEdit: ButtonModel;
  btnConfigTemplate: ButtonModel;
  uploadUrl = environment.API_URL + nodeUploadRouter.uploadDocumentFileTemplateBinary + '?bucketName=template';

  listDocumentType: any[] = [];
  listMetaData: any[] = [];

  listOfSelectedValue: any[] = [];
  listDocumentMetaData: string[] = [];

  headerUploadFile = {};

  fileUploadError = '';
  isErrorUpload = false;

  isFromGridDetail: boolean = false;

  handleCancel(): void {
    this.isVisible = false;
    if (this.isReloadGrid) {
      this.eventEmmit.emit({ type: 'success' });
    } else {
      this.eventEmmit.emit({ type: 'close' });
    }
  }

  ngOnInit(): void {
    this.initRightOfUser();
  }

  initRightOfUser(): void {
    this.btnEdit.grandAccess = this.aclService.canAbility('DOCUMENT-TEMPLATE-EDIT');
    this.btnSave.grandAccess = this.aclService.canAbility('DOCUMENT-TEMPLATE-ADD') || this.aclService.canAbility('DOCUMENT-TEMPLATE-EDIT');
    this.btnSaveAndCreate.grandAccess = this.aclService.canAbility('DOCUMENT-TEMPLATE-ADD');
  }

  updateFormToInfo(): void {
    this.updateFormType('info');
    this.form.get('name')?.disable();
    this.form.get('code')?.disable();
    // this.form.get('status')?.disable();
    this.form.get('description')?.disable();
    this.form.get('documentType')?.disable();
    this.form.get('documentMetaData')?.disable();
    this.form.get('fileName')?.disable();
    this.form.get('dateTimeValid')?.disable();
  }

  updateFormToEdit(): void {
    this.updateFormType('edit');
    this.form.get('name')?.enable();
    this.form.get('status')?.enable();
    this.form.get('description')?.enable();
    this.form.get('documentType')?.enable();
    this.form.get('documentMetaData')?.enable();
    this.form.get('fileName')?.enable();
    this.form.get('dateTimeValid')?.enable();
  }

  updateFormToAdd(): void {
    this.updateFormType('add');
    this.form.reset();
    this.form.get('name')?.enable();
    this.form.get('code')?.enable();
    this.form.get('status')?.setValue(true);
    this.form.get('status')?.enable();
    this.form.get('description')?.enable();
    this.form.get('documentType')?.enable();
    this.form.get('documentMetaData')?.enable();
    this.form.get('fileName')?.enable();
    this.form.get('dateTimeValid')?.enable();
  }

  updateFormType(type: string): void {
    switch (type) {
      case 'add':
        this.isInfo = false;
        this.isEdit = false;
        this.isAdd = true;
        // this.tittle = `Thêm mới ${this.moduleName}`;
        this.tittle = `${this.i18n.fanyi('function.document-template.modal-item.header-add')}`;
        break;
      case 'info':
        this.isInfo = true;
        this.isEdit = false;
        this.isAdd = false;
        // this.tittle = `Chi tiết ${this.moduleName}`;
        this.tittle = `${this.i18n.fanyi('function.document-template.modal-item.header-info')}`;
        break;
      case 'edit':
        this.isInfo = false;
        this.isEdit = true;
        this.isAdd = false;
        // this.tittle = `Cập nhật ${this.moduleName}`;
        this.tittle = `${this.i18n.fanyi('function.document-template.modal-item.header-edit')}`;
        break;
      default:
        this.isInfo = false;
        this.isEdit = false;
        this.isAdd = true;
        // this.tittle = `Thêm mới ${this.moduleName}`;
        this.tittle = `${this.i18n.fanyi('function.document-template.modal-item.header-add')}`;
        break;
    }
  }

  handleFileChange(data: any): void {
    if (data.type === 'success') {
      this.fileList = [data.file];
      this.uploadFile.fileBucketName = data.file?.response?.data?.bucketName;
      this.uploadFile.fileObjectName = data.file?.response?.data?.objectName;
      this.uploadFile.fileDataBucketName = data.file?.response?.data?.dataBucketName;
      this.uploadFile.fileDataObjectName = data.file?.response?.data?.dataObjectName;
      this.uploadFile.fileType = data.file?.response?.data?.fileType;
      this.uploadFile.filename = data.file?.response?.data?.fileName;
      this.uploadFile.url = data.file?.response?.data?.objectName;
      this.uploadFile.status = 'done';
      this.uploadFile.name = data.file?.name;

      this.fileUploadError = '';
      this.isErrorUpload = false;
    } else {
      this.fileUploadError = data.file?.error?.error?.message;
      this.isErrorUpload = true;
    }
  }

  getFileUrl(file: any): string {
    if (file === null || file === undefined || file === '' || file === {}) {
      return '';
    }
    return file.fileDataUrl;
    // return getUrlDownloadFile(file.fileBucketName, file.fileObjectName);
  }

  public initData(data: any, type: any = null, option: any = {}): void {
    this.isLoading = false;
    this.isReloadGrid = false;
    this.item = data;
    this.type = type;
    this.option = option;
    this.listOfSelectedValue = [];
    this.fileList = [];
    this.listDocumentMetaData = [];

    this.listMetaData = option.listMetaData;
    this.listDocumentType = option.listDocumentType;

    if (option.isFromGridDetail) this.isFromGridDetail = option.isFromGridDetail;
    if (this.isFromGridDetail) this.btnConfigTemplate.visible = true;

    this.updateFormType(type);

    if (this.item.id === null || this.item.id === undefined) {
      this.form.get('name')?.setValue(null);
      this.form.get('code')?.setValue(null);
      this.form.get('status')?.setValue(true);
      this.form.get('description')?.setValue(null);
      this.form.get('documentType')?.setValue(null);
      this.form.get('documentMetaData')?.setValue(null);
      this.form.get('fileName')?.setValue(null);
      this.form.get('dateTimeValid')?.setValue(null);
      this.updateFormToAdd();
      // TODO: Đoạn này cần phải sửa lại thành: danh sách Metadata có trường mặc định
      // this.listMetaData.forEach((element) => {
      //   for (let i = 0; i < this.listMetaDataDefault.length; i++) {
      //     if (element.note === this.listMetaDataDefault[i].label) {
      //       this.listDocumentMetaData.push(element.id);
      //     }
      //   }
      // });

      // this.listDocumentMetaData = ['0aea41a4-345b-4bbd-8f54-f0b79b8c67c2', '278f9e33-5668-4ec8-bab1-5c8f08ba388b'];
    } else {
      this.documentTemplateApiService.getById(this.item.id).subscribe((data: any) => {
        const item = data.data;
        this.form.get('name')?.setValue(item.name);
        this.form.get('code')?.setValue(item.code);
        this.form.get('status')?.setValue(item.status);
        this.form.get('description')?.setValue(item.description);
        this.form.get('documentType')?.setValue(item.documentTypeId);
        this.form.get('fileName')?.setValue(item.documentFileTemplate[0].fileName);
        this.form.get('dateTimeValid')?.setValue(item.fromDate);

        this.uploadFile = {
          uid: '1',
          name: item.documentFileTemplate[0].fileName,
          id: item.documentFileTemplate[0].id,
          fileBucketName: item.documentFileTemplate[0].fileBucketName,
          fileObjectName: item.documentFileTemplate[0].fileObjectName,
          fileDataBucketName: item.documentFileTemplate[0].fileDataBucketName,
          fileDataObjectName: item.documentFileTemplate[0].fileDataObjectName,
          fileType: item.documentFileTemplate[0].fileType,
          status: 'done',
          url: this.getFileUrl(item.documentFileTemplate[0]),
          filename: item.documentFileTemplate[0].filePath,
        };

        this.fileList = [];

        this.fileList.push(this.uploadFile);
        // console.log(this.fileList);

        // this.cdr.detectChanges();

        const listId = this.listMetaData.map((entity: any) => {
          return entity.id;
        });
        item.documentMetaDataConfig.forEach((element: any) => {
          if (listId.includes(element.metaDataId)) {
            this.listOfSelectedValue.push(element.metaDataId);
          }
        });
        this.form.get('documentMetaData')?.setValue(this.listOfSelectedValue);

        if (this.isInfo) {
          this.updateFormToInfo();
        } else {
          this.updateFormToEdit();
        }
      });
    }
  }

  resetForm(): void {
    this.form.reset();
    this.form.get('status')?.setValue(true);
    this.form.get('order')?.setValue(0);
    this.form.get('dateTimeValid')?.setValue(null);
  }

  closeModalReloadData(): void {
    this.isVisible = false;
    this.eventEmmit.emit({ type: 'success' });
  }
  isNotSelected(value: never): any {
    return this.listDocumentMetaData.indexOf(value) === -1;
  }
  save(isCreateAfter: boolean = false): Subscription | undefined {
    this.isLoading = true;

    cleanForm(this.form);
    // tslint:disable-next-line:forin
    for (const i in this.form.controls) {
      this.form.controls[i].markAsDirty();
      this.form.controls[i].updateValueAndValidity();
    }
    if (!this.form.valid) {
      this.isLoading = false;
      this.messageService.error(`${this.i18n.fanyi('function.document-template.modal-item.error.message.form-invalid')}`);
      return;
    }

    if (this.isErrorUpload) {
      this.isLoading = false;
      this.messageService.error(`Hệ thống chỉ cho phép tải file .docx, .pdf`);
      return;
    }

    var fromData = this.form.controls.dateTimeValid.value;

    this.documentTemplate.id = this.item.id;
    this.documentTemplate.name = this.form.controls.name.value;
    this.documentTemplate.code = this.form.controls.code.value.toString().toUpperCase();
    this.documentTemplate.status = this.form.controls.status.value;
    this.documentTemplate.description = this.form.controls.description.value;
    this.documentTemplate.documentTypeId = this.form.controls.documentType.value;
    this.documentTemplate.documentFileTemplate[0].id = this.uploadFile.id === null ? undefined : this.uploadFile.id;
    this.documentTemplate.documentFileTemplate[0].fileBucketName = this.uploadFile.fileBucketName;
    this.documentTemplate.documentFileTemplate[0].fileObjectName = this.uploadFile.fileObjectName;
    this.documentTemplate.documentFileTemplate[0].fileDataBucketName = this.uploadFile.fileDataBucketName;
    this.documentTemplate.documentFileTemplate[0].fileDataObjectName = this.uploadFile.fileDataObjectName;
    this.documentTemplate.documentFileTemplate[0].fileType = this.uploadFile.fileType;
    this.documentTemplate.fromDate = fromData ? moment(fromData).format('YYYY-MM-DD') : null;
    this.documentTemplate.documentFileTemplate[0].fileName = this.uploadFile.name;
    this.documentTemplate.documentMetaDataConfig = [];
    const listOfSelectedValue = this.form.controls.documentMetaData.value;
    listOfSelectedValue.forEach((element: any) => {
      const mtdt = this.listMetaData.find((x) => x.id === element);
      this.documentTemplate.documentMetaDataConfig.push({
        metaDataId: element,
        metaDataCode: mtdt.code,
        metaDataName: mtdt.name,
      });
    });

    if (this.fileList.length === 0) {
      this.isLoading = false;
      this.messageService.error(`${this.i18n.fanyi('function.document-template.modal-item.error.message.file-invalid')}`);
      return;
    }

    const data = this.documentTemplate;

    if (this.isAdd) {
      const promise = this.documentTemplateApiService.create(data).subscribe(
        (res: any) => {
          this.isLoading = false;
          if (res.code !== 200) {
            this.messageService.error(`${res.message}`);
            return;
          }
          if (res.data === null || res.data === undefined) {
            this.messageService.error(`${res.message}`);
            return;
          }
          const dataResult = res.data;
          this.messageService.success(`${res.message}`);
          this.isReloadGrid = true;
          if (isCreateAfter) {
            this.resetForm();
          } else {
            this.closeModalReloadData();
          }
        },
        (err: any) => {
          this.isLoading = false;
          if (err.error) {
            this.messageService.error(`${err.error.message}`);
          } else {
            this.messageService.error(`${err.status}`);
          }
        },
      );
      return promise;
    } else if (this.isEdit) {
      const promise = this.documentTemplateApiService.update(data).subscribe(
        (res: any) => {
          this.isLoading = false;
          if (res.code !== 200) {
            this.messageService.error(`${res.message}`);
            return;
          }
          if (res.data === null || res.data === undefined) {
            this.messageService.error(`${res.message}`);
            return;
          }
          const dataResult = res.data;
          this.messageService.success(`${res.message}`);
          this.closeModalReloadData();
        },
        (err: any) => {
          this.isLoading = false;
          if (err.error) {
            this.messageService.error(`${err.error.message}`);
          } else {
            this.messageService.error(`${err.status}`);
          }
        },
      );
      return promise;
    } else {
      return;
    }
  }

  changeDateTimeValid($event: any) {
    // if (moment($event) > moment()) {
    //   this.form.get('status')?.setValue(false);
    // }
  }

  chageStatus($event: any) {
    // if ($event && this.form.get('dateTimeValid')?.value && moment(this.form.get('dateTimeValid')?.value) > moment()) {
    //   this.form.get('status')?.setValue(false);
    // }
  }
}
