export const authenticationRouter = {
  getToken: `api/v1/authentication/jwt/login`,
  getTokenAuthenWithAD: `api/v1/authentication/ad/login`,
};
export const authWSO2 = {
  authorize: 'oauth2/authorize?response_type=code&client_id=',
  redirect_uri: '&redirect_uri=',
  scope: '&scope=openid',
  authenticationInfoByCode: '/authenticationinfo?_allow_anonymous=true',
  logout: 'logout/',
  logoutWso2: 'oidc/logout?id_token_hint=',
  refreshUrl: '/refreshtoken?_allow_anonymous=true',
  post_logout_redirect_uri: '&post_logout_redirect_uri=',
};
export const homeRouter = {
  getDocumentByStatus: `api/v1/dashboard/number-document-by-status`,
  getDocumentInfo: `api/v1/dashboard/number-document-by-status-package-service`,
};
export const countryRouter = {
  create: `api/v1/country`,
  createMany: `api/v1/country/create-many`,
  update: `api/v1/country`,
  delete: `api/v1/country`,
  getById: `api/v1/country?id=`,
  getFilter: `api/v1/country/filter`,
  getAll: `api/v1/country/all`,
  getListCombobox: `api/v1/country/for-combobox`,
};
export const userSignConfigRouter = {
  create: `api/v1/user-sign-config`,
  update: `api/v1/user-sign-config`,
  delete: `api/v1/user-sign-config`,
  getFilter: `api/v1/user-sign-config/filter`,
  getListCombobox: `api/v1/user-sign-config/for-combobox`,
  getListComboboxSign: `api/v1/user-sign-config/for-combobox-sign`,
};
// ngay 22/9/2021
export const userHSMAccountRouter = {
  create: `api/v1/user-hsm-account`,
  update: `api/v1/user-hsm-account`,
  delete: `api/v1/user-hsm-account`,
  getFilter: `api/v1/user-hsm-account/filter`,
  getListCombobox: `api/v1/user-hsm-account/for-combobox`,
  getListComboboxHSMValid: `api/v1/user-hsm-account/for-combobox-hsm-valid`,
  getInfoCertificate: `api/v1/user-hsm-account/get-info-cert?userHSMAccountId=`,
  downloadCertificate: `api/v1/user-hsm-account/download-certificate?userHSMAccountId=`,
  getHSMAccount: `api/v1/user-hsm-account/get-hsm-account`,
  updateStatus: `api/v1/user-hsm-account/update-status`,
};
// ngay 22/9/2021
export const provinceRouter = {
  create: `api/v1/province`,
  createMany: `api/v1/province/create-many`,
  update: `api/v1/province`,
  delete: `api/v1/province`,
  getById: `api/v1/province?id=`,
  getFilter: `api/v1/province/filter`,
  getAll: `api/v1/province/all`,
  getListCombobox: `api/v1/province/for-combobox`,
};

export const districtRouter = {
  // getById: `api/v1/district?id=`,
  // getListCombobox: `api/v1/district/for-combobox`,
  create: `api/v1/district`,
  createMany: `api/v1/district/create-many`,
  update: `api/v1/district`,
  delete: `api/v1/district`,
  getById: `api/v1/district?id=`,
  getFilter: `api/v1/district/filter`,
  getAll: `api/v1/district/all`,
  getListCombobox: `api/v1/district/for-combobox`,
};

export const wardRouter = {
  create: `api/v1/ward`,
  createMany: `api/v1/ward/create-many`,
  update: `api/v1/ward`,
  delete: `api/v1/ward`,
  getById: `api/v1/ward?id=`,
  getFilter: `api/v1/ward/filter`,
  getAll: `api/v1/ward/all`,
  getListCombobox: `api/v1/ward/for-combobox`,
};

export const usersRouter = {
  create: `api/v1/user`,
  createMany: `api/v1/user/create-many`,
  update: `api/v1/user`,
  updateUserProfile:`api/v1/user/update-user-profile`,
  sendOTPAuth: `api/v1/user/send-otp-auth`,
  getCurrentUserInfo: `api/v1/user/get-current-user-info`,
  getListUserDevice: `api/v1/user/get-list-user-device?userId=`,
  updateStatus: `api/v1/user-hsm-account/update-status`,
  delete: `api/v1/user`,
  lock: `api/v1/user/lock`,
  getById: `api/v1/user?id=`,
  getFilter: `api/v1/user/filter`,
  getUserHSMAccount: `api/v1/user-hsm-account/filter`,
  getAll: `api/v1/user/all`,
  getUserPermission: `api/v1/user/get-permission-current-user`,
  getListCombobox: `api/v1/user/for-combobox`,
  getUserOrOrgInfo: `api/v1/user/get-user-org-info`,
};
export const userRoleRouter = {
  addRole: `api/v1/user-role/add-role`,
  getById: `api/v1/user-role?id=`,
  getByIdOwner: `api/v1/user-role/owner`,
};
export const orgConfigRouter = {
  createOrUpdate: `api/v1/org-config/create-or-update`,
  getById: `api/v1/org-config?id=`,
};

export const reportRouter = {
  GetReportDocumentByOrgID: `api/v1/report/get-report-document-by-org`,
};

export const emailAccountRouter = {
  getListCombobox: `api/v1/email-account/for-combobox?count=0`,
};
export const navigationRouter = {
  getNavigationOwner: `api/v1/bsd/navigations/owner`,
};
export const servicePackageRouter = {
  create: `api/v1/service-pack`,
  generateCode: `api/v1/service-pack/generate-code`,
  createMany: `api/v1/service-pack/create-many`,
  update: `api/v1/service-pack`,
  delete: `api/v1/service-pack`,
  getById: `api/v1/service-pack?id=`,
  getFilter: `api/v1/service-pack/filter`,
  getAll: `api/v1/service-pack/all`,
  getListCombobox: `api/v1/service-pack/for-combobox`,
};
export const certRouter = {
  create: `api/v1/certificate`,
  update: `api/v1/certificate`,
  delete: `api/v1/certificate`,
  getById: `api/v1/certificate?id=`,
  getFilter: `api/v1/certificate/filter`,
  getAll: `api/v1/certificate/all`,
  getListCombobox: `api/v1/certificate/for-combobox`,
  downloadCertFile: `api/v1/certificate/download-cert-file`,
  downloadCertBase64: `api/v1/certificate/download-cert-base64`,
  checkCert: `api/v1/certificate/user/check-cert`,
};
export const certificateAuthorityRouter = {
  create: `api/v1/certificate-authority`,
  update: `api/v1/certificate-authority`,
  delete: `api/v1/certificate-authority`,
  infoCertFile: `api/v1/certificate-authority/info-cert-file?id=`,
  getById: `api/v1/certificate-authority?id=`,
  getFilter: `api/v1/certificate-authority/filter`,
  getAll: `api/v1/certificate-authority/all`,
  getListCombobox: `api/v1/certificate-authority/for-combobox`,
  readFileCert: `api/v1/certificate-authority/read-file-cer`,
  validateOCSP: `api/v1/certificate-authority/validate-ocsp`,
  validateCRL: `api/v1/certificate-authority/validate-crl`,
};

export const nodeUploadRouter = {
  uploadFileBinary: `api/v1/core/minio/upload-object?isConvertToPDFA=true`,
  uploadObject: `api/v1/core/minio/upload-object`,
  uploadDocumentFileTemplateBinary: `api/v1/core/minio/upload-document-file-template`,
  downloadFile: `api/v1/core/minio/download-object`,
  downloadFileBase64: `api/v1/core/minio/download-object-base64`,
  uploadFileUnsave: `api/v1/core/minio/upload-file-unsave`,
};

export const unitRouter = {
  create: `api/v1/res/unit`,
  createMany: `api/v1/res/unit/create-many`,
  update: `api/v1/res/unit`,
  delete: `api/v1/res/unit`,
  getById: `api/v1/res/unit?id=`,
  getFilter: `api/v1/res/unit/filter`,
  getAll: `api/v1/res/unit/all`,
  getListCombobox: `api/v1/res/unit/for-combobox`,
};

export const certifyTypeRouter = {
  create: `api/v1/document-type`,
  createMany: `api/v1/document-type/create-many`,
  update: `api/v1/document-type`,
  delete: `api/v1/document-type`,
  getById: `api/v1/document-type?id=`,
  getFilter: `api/v1/document-type/filter`,
  getAll: `api/v1/document-type/all`,
  getListCombobox: `api/v1/document-type/for-combobox`,
  getAllListCombobox: `api/v1/document-type/all-for-combobox`,
  getListComboboxAllStatus: `api/v1/document-type/for-combobox-all-status`,
};

export const infoInCertify = {
  create: `api/v1/meta-data`,
  createMany: `api/v1/meta-data/create-many`,
  update: `api/v1/meta-data`,
  delete: `api/v1/meta-data`,
  getById: `api/v1/meta-data?id=`,
  getFilter: `api/v1/meta-data/filter`,
  getAll: `api/v1/meta-data/all`,
  getListCombobox: `api/v1/meta-data/for-combobox`,
};

export const userRouter = {
  getListRightOfUser: `api/v1/idm/user`,
  getListRoleOfUser: `api/v1/idm/user`,
  changePassword: `api/v1/user/update-password`,
  create: `api/v1/user`,
  update: `api/v1/user`,
  delete: `api/v1/user`,
  getById: `api/v1/user?id=`,
  getFilter: `api/v1/user/filter`,
  getAll: `api/v1/user/all`,
  getListCombobox: `api/v1/user/for-combobox`,
  getListComboboxByRootOrg: `api/v1/user/for-combobox-by-root-org`,
  updateUserPIN: `api/v1/user/update-user-pin`,
  getUserRole: `api/v1/user/get-user-role`,
  updateUserRole: `api/v1/user/update-user-role`,
  saveListUserRole: `api/v1/user/save-list-user-role`,
  getListUserIdByRole: `api/v1/user/get-list-user-id-by-role`,
  getListComboboxFilterInternalUser: `api/v1/user/for-combobox-filter-internal-user`,
  userConfig: `api/v1/user/init-user-admin-org`,
};

export const workflowRouter = {
  create: `api/v1/workflow`,
  createMany: `api/v1/workflow/create-many`,
  update: `api/v1/workflow`,
  delete: `api/v1/workflow`,
  getById: `api/v1/workflow?id=`,
  getFilter: `api/v1/workflow/filter`,
  getAll: `api/v1/workflow/all`,
  getListCombobox: `api/v1/workflow/for-combobox`,
};

export const workflowStateRouter = {
  create: `api/v1/workflow-state`,
  // createMany: `api/v1/workflow-state/create-many`,
  update: `api/v1/workflow-state`,
  delete: `api/v1/workflow-state`,
  getById: `api/v1/workflow-state?id=`,
  getFilter: `api/v1/workflow-state/filter`,
  getListCombobox: `api/v1/workflow-state/for-combobox`,
  // getAll: `api/v1/workflow-state/all`,
};

export const notifyConfigRouter = {
  create: `api/v1/notify-config`,
  update: `api/v1/notify-config`,
  delete: `api/v1/notify-config`,
  getById: `api/v1/notify-config?id=`,
  getFilter: `api/v1/notify-config/filter`,
  getListCombobox: `api/v1/notify-config/for-combobox`,
};

export const organizationRouter = {
  create: `api/v1/organization`,
  createMany: `api/v1/organization/create-many`,
  update: `api/v1/organization`,
  delete: `api/v1/organization`,
  getOrgInfoByCurrentUser: `api/v1/organization/get-org-info-current-user`,
  getById: `api/v1/organization?id=`,
  getFilter: `api/v1/organization/filter`,
  getAll: `api/v1/organization/all`,
  getListCombobox: `api/v1/organization/for-combobox`,
  getListComboboxCurrentOrgOfUser: `api/v1/organization/for-combobox-current-org-of-user`,
  getListComboboxAll: `api/v1/organization/for-combobox-all`,
};
// 23-9-2021
export const organizationTypeRouter = {
  create: `api/v1/organization-type`,
  createMany: `api/v1/organization-type/create-many`,
  update: `api/v1/organization-type`,
  delete: `api/v1/organization-type`,
  getById: `api/v1/organization-type?id=`,
  getFilter: `api/v1/organization-type/filter`,
  getAll: `api/v1/organization-type/all`,
  getListCombobox: `api/v1/organization-type/for-combobox`,
};
// 23-9-2021
export const documentRouter = {
  create: `api/v1/document`,
  createMany: `api/v1/document/create-many`,
  update: `api/v1/document`,
  updateSignExpireAtDate: 'api/v1/document/update-sign-expire',
  updateStatusTocancel: 'api/v1/document/update-status-to-cancel',
  delete: `api/v1/document`,
  sendToWorkflow: `api/v1/document/send-to-wf`,
  sendEmail: `api/v1/document/send-complete-mail`,
  sendEmailToUserSign: `api/v1/document/send-email-to-usersign`,
  processingWorkflow: `api/v1/document/processing-workflow`,
  rejectDocument: `api/v1/document/reject`,
  approveDocument: `api/v1/document/approve`,
  getById: `api/v1/document?id=`,
  getByListId: `api/v1/document/get-many`,
  getDocumentWFLHistory: `api/v1/document/get-document-wfl-history?docId=`,
  getFilter: `api/v1/document/filter`,
  getAll: `api/v1/document/all`,
  getListCombobox: `api/v1/document/for-combobox`,
  getMaxExpiredAfterDayByListDocumentId: 'api/v1/document/get-max-expired-after-day',
  sendEmailToUserSignWithConfig: `api/v1/document/send-email-to-usersign-with-config`,
  getListDocumentByListUserId: `api/v1/document/get-list-document-by-list-user`,
  generateImagePreview: `api/v1/document/generate-image-preview`,
  getUserInFlowByListDocument: `api/v1/document/get-user-in-flow-by-list-document`,
};

export const documentBatchRouter = {
  create: `api/v1/document-batch`,
  createMany: `api/v1/document-batch/create-many`,
  update: `api/v1/document-batch`,
  generateCertificate: `api/v1/document-batch/generate-certificate`,
  delete: `api/v1/document-batch`,
  getById: `api/v1/document-batch?id=`,
  getFilter: `/api/v1/document-batch/filter`,
  getAll: `api/v1/document-batch/all`,
  getListCombobox: `api/v1/document-batch/for-combobox`,
};

export const documentTemplateRouter = {
  create: `api/v1/document-template`,
  duplicate: `api/v1/document-template/duplicate`,
  createMany: `api/v1/document-template/create-many`,
  update: `api/v1/document-template`,
  updateMetaDataConfig: `api/v1/document-template/update-meta-data-config`,
  delete: `api/v1/document-template`,
  getById: `api/v1/document-template?id=`,
  getFilter: `api/v1/document-template/filter`,
  getListDocumentTemplateByGroupCode: `api/v1/document-template/get-document-template-by-group-code`,
  getAll: `api/v1/document-template/all`,
  getListCombobox: `api/v1/document-template/for-combobox`,
  getByType: `api/v1/document-template/get-by-type`,
};

export const positionRouter = {
  create: `api/v1/position`,
  createMany: `api/v1/position/create-many`,
  update: `api/v1/position`,
  delete: `api/v1/position`,
  getById: `api/v1/position?id=`,
  getFilter: `api/v1/position/filter`,
  getAll: `api/v1/position/all`,
  getListCombobox: `api/v1/position/for-combobox`,
};

export const systemLogRouter = {
  getById: `api/v1/system-log?id=`,
  getFilter: `api/v1/system-log/filter`,
  getByDocument: `api/v1/system-log/get-by-document`,
  getAllActionCodeForCombobox: `api/v1/system-log/get-all-action-code-for-combobox`,
};

export const documentSignRouter = {
  getDocument: `api/v1/sign/get-document`, //
  sendOTP: `api/v1/sign/send-otp`,
  sendOTPAccessDocument: `api/v1/sign/send-otp-access-document`,
  getDocumentSigned: `api/v1/sign/get-document-signed`,
  sign: `api/v1/sign/sign`,
  signMultiple: `api/v1/sign/sign-multiple`,
  signDigital: `api/v1/sign-hash/electtronic-sign`,
  signDigitalMail: `api/v1/sign-hash/electtronic-sign-from-sign-page`,
  signHSM: `api/v1/sign-hash/sign-hsm`,
  signADSS: `api/v1/sign-hash/sign-adss`,
  signUSBToken: `api/v1/sign/sign-usb-token`,
  signUSBTokenHash: `api/v1/sign/hash`,
  signMultiUSBToken: `api/v1/sign/sign-usb-token-multile`,
  getCoordinate: `api/v1/sign/get-coordinate`,
  getMultiCoordinate: `api/v1/sign/get-list-coordinate`,
  rejectDoc: `api/v1/sign/reject-document`,
};
export const userHSMRouter = {
  getListCombobox: `api/v1/user-hsm-account/for-combobox`,
};
export const roleRouter = {
  create: `api/v1/role`,
  update: `api/v1/role`,
  delete: `api/v1/role`,
  getById: `api/v1/role?id=`,
  getFilter: `api/v1/role/filter`,
  getListCombobox: `api/v1/role/for-combobox`,
  savePermission: `api/v1/role/update-data-permission`,
  getDataPermission: `api/v1/role/get-data-permission`,
  getListRightIdByRole: `api/v1/role/get-list-right-by-role`,
  updateRightByRole: `api/v1/role/update-right-by-role`,
  getListNavigationIdByRole: `api/v1/role/get-list-navigation-by-role`,
  updateNavigationByRole: `api/v1/role/update-navigation-by-role`,
};
export const menuRouter = {
  create: `api/v1/navigation`,
  update: `api/v1/navigation`,
  delete: `api/v1/navigation`,
  getById: `api/v1/navigation?id=`,
  getFilter: `api/v1/navigation/filter`,
  getListCombobox: `api/v1/navigation/for-combobox`,
  getAllListCombobox: `api/v1/navigation/all-for-combobox`,
};
export const rightRouter = {
  create: `api/v1/right`,
  update: `api/v1/right`,
  delete: `api/v1/right`,
  getById: `api/v1/right?id=`,
  getFilter: `api/v1/right/filter`,
  getListCombobox: `api/v1/right/for-combobox`,
};
export const keycloakRouter = {
  verify: 'api/v1/keycloak/verify',
  getUserInfo: 'api/v1/keycloak/get-user-info',
  refreshToken: 'api/v1/keycloak/refreshtoken',
  getAccessToken: 'api/v1/keycloak/get-access-token',
  logout: 'api/v1/keycloak/logout',
};
