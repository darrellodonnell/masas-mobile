package com.continuumloop.masas_mobile_android_build;

import org.apache.cordova.DroidGap; 
import android.os.Bundle;


public class MainActivity extends DroidGap {

    @Override
    public void onCreate(Bundle savedInstanceState) {
    	super.onCreate(savedInstanceState);
        super.loadUrl("file:///android_asset/www/index.html");
    }

   
    
}
