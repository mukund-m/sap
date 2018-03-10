sap.ui.define([
		'sap/ui/demo/toolpageapp/controller/BaseController',
		'sap/ui/model/json/JSONModel',
		'sap/ui/Device',
		'sap/m/MessageBox',
		'sap/ui/demo/toolpageapp/model/formatter'
	], function (BaseController, JSONModel, Device,FileSizeFormat, MessageBox, formatter) {
		"use strict";
		return BaseController.extend("sap.ui.demo.toolpageapp.controller.Login", {
			formatter: formatter,

			onInit: function () {
				var oViewModel = new JSONModel({
					userName : '',
					password: ''
				});
				this.setModel(oViewModel, "login");
			},
			
			login: function() {
				var userName = this.getModel("login").getData().userName;
				var password = this.getModel("login").getData().password;
				if(!userName || !password) {
					var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
					sap.m.MessageBox.error(
	    				"Please fill both user name and password",
	    				{
	    					styleClass: bCompact ? "sapUiSizeCompact" : ""
	    				}
	    			);
				}
				var aData = jQuery.ajax({
		            type : "POST",
		            dataType : "json",
		            contentType:"application/json",
		            url : "http://localhost:8082/api/authenticate",
		            data: JSON.stringify({username: userName, password: password}),
		            success : (data,textStatus, jqXHR) => {
		            	console.log(data);
		            	sessionStorage.setItem("IdToken", data.id_token);
		            	this.getRouter().navTo( "home")
		            },
		            error: () => {
		            	var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
		    			sap.m.MessageBox.error(
		    				"Invalid Credentials",
		    				{
		    					styleClass: bCompact ? "sapUiSizeCompact" : ""
		    				}
		    			);
		            }

		        });
			}
	});
});