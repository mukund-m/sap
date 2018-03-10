sap.ui.define([
		'sap/ui/demo/toolpageapp/controller/BaseController',
		'sap/ui/model/json/JSONModel',
		'sap/ui/Device',
		'sap/ui/demo/toolpageapp/model/formatter'
	], function (BaseController, JSONModel, Device,FileSizeFormat, formatter, ObjectMarker) {
		"use strict";
		return BaseController.extend("sap.ui.demo.toolpageapp.controller.Request", {
			formatter: formatter,

			onInit: function () {
				
				
				
				var reqHeaderViewModel = new JSONModel({
					title : '',
					type: '',
					startDate: '',
					duration: ''
					
				});
				this.setModel(reqHeaderViewModel, "requestHeader");
				
				var mainModel = {};
				var oViewModel = new JSONModel({
					isPhone : Device.system.phone
				});
				this.setModel(oViewModel, "view");
				
				
				mainModel.requestTypes = [
						  {
						  key: "DOC",
						  text: "Documentation"
						  },
						  {
						  "key": "ENG",
						  "text": "Engineering"
						  },
						  {
						  "key": "ASS",
						  "text": "Asset"
						  },
						  {
							  "key": "OPD",
							  "text": "Operational Deviation"
							  }
						];
				mainModel.catalog = {
					    "clothing": {
					        "categories": [
					          {"name": "Review", "Id": "102","type":"Structure", "categories": [
					        	  {"name": "Initial Review", "Id": "103","type":"Task", "status": "Completed", "resp": "MOC Coordinator", "notified": "01/01/2018",
					        		  "dueDate": "01/01/2018", "completed": "01/01/2018"}
					          ]},
					          {"name": "Approval", "Id": "102","type":"Structure", "categories": [
					        	  {"name": "HSE Approval", "Id": "103","type":"Structure", "status": "Open", "resp": "MOC Coordinator", "notified": "01/01/2018",
					        		  "dueDate": "01/01/2018", "completed": "01/01/2018"},
					        		  {"name": "HSE Approval", "Id": "103","type":"Structure", "status": "Open", "resp": "MOC Coordinator", "notified": "01/01/2018",
						        		  "dueDate": "01/01/2018", "completed": "01/01/2018"}
					          ]}
					          ]}

					      }
				mainModel.attachments = [
					{
						"documentId": "64469d2f-b3c4-a517-20d6-f91ebf85b9da",
						"fileName": "Screenshot.jpg",
						"mimeType": "image/jpg",
						"thumbnailUrl": "",
						"url": "test-resources/sap/m/demokit/sample/UploadCollection/LinkedDocuments/Screenshot.jpg",
						"attributes": [
							{
								"title": "Uploaded By",
								"text": "Susan Baker",
								"active": true
							},
							{
								"title": "Uploaded On",
								"text": "2014-09-03",
								"active": false
							}
						],
						"markers": [
							{
								"type": "Flagged"
							}
						],
						"selected": false
					}, {
						"documentId": "5082cc4d-da9f-2835-2c0a-8100ed47bcde",
						"fileName": "Notes.txt",
						"mimeType": "text/plain",
						"thumbnailUrl": "",
						"url": "test-resources/sap/m/demokit/sample/UploadCollection/LinkedDocuments/Notes.txt",
						"attributes": [
							{
								"title": "Uploaded By",
								"text": "John Smith",
								"active": false
							},
							{
								"title": "Uploaded On",
								"text": "2014-09-02",
								"active": true
							}
						],
						"markers": [
							{
								"type": "Flagged"
							},
							{
								"type": "Favorite"
							}
						],
						"selected": false
					}];
				this.getView().setModel(new sap.ui.model.json.JSONModel(mainModel));
				var reqHeaderModel = new sap.ui.model.json.JSONModel();
				
				
				this.getView().setModel(new JSONModel({
					"maximumFilenameLength": 55,
					"maximumFileSize": 10,
					"uploadEnabled": true,
					"uploadButtonVisible": true,
					"enableEdit": true,
					"enableDelete": true,
					"visibleEdit": true,
					"visibleDelete": true
				}), "fileUploadSettings");
				
				
				
				
				Device.media.attachHandler(function (oDevice) {
					this.getModel("view").setProperty("/isPhone", oDevice.name === "Phone");
				}.bind(this));
			},
			typeChanged: function(evnt) {
				
				var data = this.getModel("requestHeader").getData();
				data.type = evnt.getParameters().selectedItem.getKey();
				
				this.getModel("requestHeader").setData(data);
				this.getView().byId("__form").destroyContent();
				this.getData("http://localhost:8082/api/request-type-def-fields/"+data.type, (data) => {

	            	sessionStorage.setItem("definitions", JSON.stringify(data))
	                for(var i=0;i<data.length;i++) {
	                	var field = data[i];
	                	if(field.fieldType == 'Title') {
	                		this.getView().byId("__form").addContent(new sap.ui.core.Title({
	        					text: field.name
	        				}))
	                	}
	                	if(field.fieldType == 'Label'	) {
	                		this.getView().byId("__form").addContent(new sap.m.Label({
	        					text: field.name
	        				}))
	                	}
	                	if(field.fieldType == 'FreeText'	) {
	                		this.getView().byId("__form").addContent(new sap.m.TextArea({
	        					placeholder: field.placeHolder,
	        					
	        					id: "def_"+field.id
	        				}))
	                	}
	                	
	                	if(field.fieldType == 'Text'	) {
	                		this.getView().byId("__form").addContent(new sap.m.Input({
	                			type: 'Text',
	        					placeholder: field.placeHolder,
	        					id: "def_"+field.id,
	        					value: "{/field_"+ field.id+"}"
	        				}))
	                	}
	                	
	                }
				} )
				
			},
			
			durationSelected: function(evnt) {
				var data = this.getModel("requestHeader").getData();
				data.duration = evnt.getParameters().selectedIndex;
				
				this.getModel("requestHeader").setData(data);
			},
			
			handleStartDateChange: function(evnt) {
				var data = this.getModel("requestHeader").getData();
				data.startDate = evnt.getParameters().value;
				
				this.getModel("requestHeader").setData(data);
			},
			saveRequest: function(evnt) {
				var data = this.getModel("requestHeader").getData();
				
				var requestData = {
						title: data.title,
						type: data.type,
						startDate: new Date(Date.parse(data.startDate)),
						duration: data.duration+'',
						status: "SAVED"
				}
				this.postData(requestData, "http://localhost:8082/api/requests", (data) => {
					console.log(data);
	            	//now store the definitions
	            	var defData = this.getModel().getData();
	            	var definitions = JSON.parse(sessionStorage.getItem("definitions"));
	            	for(var i=0; i<definitions.length; i++ ) {
	            		var def = definitions[i];
	            		if(def.fieldType == 'Text') {
	            			console.log(defData["field_"+def.id])
	            			var reqDefData = {
	            				fieldDefinition: def,
	            				request: data,
	            				value: defData["field_"+def.id]
	            			}
	            			
	            			this.postData(reqDefData, "http://localhost:8082/api/reuest-definitions", (reqDefSavedData) => {
	            				
	            			})
	            			
	            		}
	            		if(def.fieldType == 'FreeText') {
	            			
	            		}
	            	}
	            	this.getRouter().navTo( "home")
				}, () => {

	            	var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
	    			sap.m.MessageBox.error(
	    				"Invalid Credentials",
	    				{
	    					styleClass: bCompact ? "sapUiSizeCompact" : ""
	    				}
	    			);
				} )
				
			},
			createObjectMarker: function(sId, oContext) {
				var mSettings = null;

				if (oContext.getProperty("type")) {
					mSettings = {
						type: "{type}",
						press: this.onMarkerPress
					};
				}
				return new ObjectMarker(sId, mSettings);
			},

			formatAttribute: function(sValue) {
				return sValue
			},
			

			onChange: function(oEvent) {
				var oUploadCollection = oEvent.getSource();
				// Header Token
				var oCustomerHeaderToken = new UploadCollectionParameter({
					name: "x-csrf-token",
					value: "securityTokenFromModel"
				});
				oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
			},

			onFileDeleted: function(oEvent) {
				this.deleteItemById(oEvent.getParameter("documentId"));
				MessageToast.show("FileDeleted event triggered.");
			},

			deleteItemById: function(sItemToDeleteId) {
				var oData = this.getView().byId("UploadCollection").getModel().getData();
				var aItems = jQuery.extend(true, {}, oData).items;
				jQuery.each(aItems, function(index) {
					if (aItems[index] && aItems[index].documentId === sItemToDeleteId) {
						aItems.splice(index, 1);
					}
				});
				this.getView().byId("UploadCollection").getModel().setData({
					"items": aItems
				});
				this.getView().byId("attachmentTitle").setText(this.getAttachmentTitleText());
			},

			deleteMultipleItems: function(aItemsToDelete) {
				var oData = this.getView().byId("UploadCollection").getModel().getData();
				var nItemsToDelete = aItemsToDelete.length;
				var aItems = jQuery.extend(true, {}, oData).items;
				var i = 0;
				jQuery.each(aItems, function(index) {
					if (aItems[index]) {
						for (i = 0; i < nItemsToDelete; i++) {
							if (aItems[index].documentId === aItemsToDelete[i].getDocumentId()) {
								aItems.splice(index, 1);
							}
						}
					}
				});
				this.getView().byId("UploadCollection").getModel().setData({
					"items": aItems
				});
				this.getView().byId("attachmentTitle").setText(this.getAttachmentTitleText());
			},

			onFilenameLengthExceed: function() {
				MessageToast.show("FilenameLengthExceed event triggered.");
			},

			onFileRenamed: function(oEvent) {
				var oData = this.getView().byId("UploadCollection").getModel().getData();
				var aItems = jQuery.extend(true, {}, oData).items;
				var sDocumentId = oEvent.getParameter("documentId");
				jQuery.each(aItems, function(index) {
					if (aItems[index] && aItems[index].documentId === sDocumentId) {
						aItems[index].fileName = oEvent.getParameter("item").getFileName();
					}
				});
				this.getView().byId("UploadCollection").getModel().setData({
					"items": aItems
				});
				MessageToast.show("FileRenamed event triggered.");
			},

			onFileSizeExceed: function() {
				MessageToast.show("FileSizeExceed event triggered.");
			},

			onTypeMissmatch: function() {
				MessageToast.show("TypeMissmatch event triggered.");
			},

			onUploadComplete: function(oEvent) {
				var oUploadCollection = this.getView().byId("UploadCollection");
				var oData = oUploadCollection.getModel().getData();

				oData.items.unshift({
					"documentId": jQuery.now().toString(), // generate Id,
					"fileName": oEvent.getParameter("files")[0].fileName,
					"mimeType": "",
					"thumbnailUrl": "",
					"url": "",
					"attributes": [
						{
							"title": "Uploaded By",
							"text": "You",
							"active": false
						},
						{
							"title": "Uploaded On",
							"text": new Date(jQuery.now()).toLocaleDateString(),
							"active": false
						},
						{
							"title": "File Size",
							"text": "505000",
							"active": false
						}
					],
					"statuses": [
						{
							"title": "",
							"text": "",
							"state": "None"
						}
					],
					"markers": [
						{
						}
					],
					"selected": false
				});
				this.getView().getModel().refresh();

				// Sets the text to the label
				this.getView().byId("attachmentTitle").setText(this.getAttachmentTitleText());

				// delay the success message for to notice onChange message
				setTimeout(function() {
					MessageToast.show("UploadComplete event triggered.");
				}, 4000);
			},

			onBeforeUploadStarts: function(oEvent) {
				// Header Slug
				var oCustomerHeaderSlug = new UploadCollectionParameter({
					name: "slug",
					value: oEvent.getParameter("fileName")
				});
				oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
				MessageToast.show("BeforeUploadStarts event triggered.");
			},

			onUploadTerminated: function() {
				/*
				// get parameter file name
				var sFileName = oEvent.getParameter("fileName");
				// get a header parameter (in case no parameter specified, the callback function getHeaderParameter returns all request headers)
				var oRequestHeaders = oEvent.getParameters().getHeaderParameter();
				*/
			},

			onFileTypeChange: function(oEvent) {
				this.getView().byId("UploadCollection").setFileType(oEvent.getSource().getSelectedKeys());
			},

			onSelectAllPress: function(oEvent) {
				var oUploadCollection = this.getView().byId("UploadCollection");
				if (!oEvent.getSource().getPressed()) {
					this.deselectAllItems(oUploadCollection);
					oEvent.getSource().setPressed(false);
					oEvent.getSource().setText("Select all");
				} else {
					this.deselectAllItems(oUploadCollection);
					oUploadCollection.selectAll();
					oEvent.getSource().setPressed(true);
					oEvent.getSource().setText("Deselect all");
				}
				this.onSelectionChange(oEvent);
			},

			deselectAllItems: function(oUploadCollection) {
				var aItems = oUploadCollection.getItems();
				for (var i = 0; i < aItems.length; i++) {
					oUploadCollection.setSelectedItem(aItems[i], false);
				}
			},

			getAttachmentTitleText: function() {
				var aItems = this.getView().byId("UploadCollection").getItems();
				return "Uploaded (" + aItems.length + ")";
			},

			onModeChange: function(oEvent) {
				var oSettingsModel = this.getView().getModel("settings");
				if (oEvent.getParameters().selectedItem.getProperty("key") === MobileLibrary.ListMode.MultiSelect) {
					oSettingsModel.setProperty("/visibleEdit", false);
					oSettingsModel.setProperty("/visibleDelete", false);
					this.enableToolbarItems(true);
				} else {
					oSettingsModel.setProperty("/visibleEdit", true);
					oSettingsModel.setProperty("/visibleDelete", true);
					this.enableToolbarItems(false);
				}
			},

			enableToolbarItems: function(status) {
				this.getView().byId("selectAllButton").setVisible(status);
				this.getView().byId("deleteSelectedButton").setVisible(status);
				this.getView().byId("selectAllButton").setEnabled(status);
				// This is only enabled if there is a selected item in multi-selection mode
				if (this.getView().byId("UploadCollection").getSelectedItems().length > 0) {
					this.getView().byId("deleteSelectedButton").setEnabled(true);
				}
			},

			onDeleteSelectedItems: function() {
				var aSelectedItems = this.getView().byId("UploadCollection").getSelectedItems();
				this.deleteMultipleItems(aSelectedItems);
				if (this.getView().byId("UploadCollection").getSelectedItems().length < 1) {
					this.getView().byId("selectAllButton").setPressed(false);
					this.getView().byId("selectAllButton").setText("Select all");
				}
				MessageToast.show("Delete selected items button press.");
			},

			onSearch: function() {
				MessageToast.show("Search feature isn't available in this sample");
			},

			onSelectionChange: function() {
				var oUploadCollection = this.getView().byId("UploadCollection");
				// Only it is enabled if there is a selected item in multi-selection mode
				if (oUploadCollection.getMode() === MobileLibrary.ListMode.MultiSelect) {
					if (oUploadCollection.getSelectedItems().length > 0) {
						this.getView().byId("deleteSelectedButton").setEnabled(true);
					} else {
						this.getView().byId("deleteSelectedButton").setEnabled(false);
					}
				}
			},

			onAttributePress: function(oEvent) {
				MessageToast.show("Attribute press event - " + oEvent.getSource().getTitle() + ": " + oEvent.getSource().getText());
			},

			onMarkerPress: function(oEvent) {
				MessageToast.show("Marker press event - " + oEvent.getSource().getType());
			},

			onOpenAppSettings: function(oEvent) {
				if (!this.oSettingsDialog) {
					this.oSettingsDialog = sap.ui.xmlfragment("sap.m.sample.UploadCollection.AppSettings", this);
					this.getView().addDependent(this.oSettingsDialog);
				}
				jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this.oSettingsDialog);
				this.oSettingsDialog.open();
			},

			onDialogCloseButton: function() {
				this.oSettingsDialog.close();
			},
			  getData: function(url,callback) {
				  jQuery.ajax({
			            type : "GET",
			            contentType : "application/json",
			            url : url,
			            dataType : "json",
			            async: false, 
			            beforeSend: function(xhr){xhr.setRequestHeader('Authorization', 'Bearer '+ sessionStorage.getItem("IdToken"));},
			            success : (data,textStatus, jqXHR) => {
			            	callback(data);
			            }

			        })
			  },
			  
			  postData: function(requestData, url, callback, errorCallback) {
				  var token = sessionStorage.getItem("IdToken");
				  jQuery.ajax({
			            type : "POST",
			            dataType : "json",
			            contentType:"application/json",
			            url : url,
			            beforeSend: function(xhr){xhr.setRequestHeader('Authorization', 'Bearer '+token);},
			            data: JSON.stringify(requestData),
			            success : (data,textStatus, jqXHR) => {
			            	callback(data);
			            },
			            error: () => {
			            	errorCallback();
			            }

			        });
			  }
			
			
		});
});