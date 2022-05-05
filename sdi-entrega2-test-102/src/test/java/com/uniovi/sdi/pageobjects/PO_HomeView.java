package com.uniovi.sdi.pageobjects;

import com.uniovi.sdi.util.SeleniumUtils;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import java.util.List;

public class PO_HomeView extends PO_NavView {

    static public void checkWelcomeToPage(WebDriver driver) {
        //Esperamos a que se cargue el saludo de bienvenida en Español
        SeleniumUtils.waitLoadElementsBy(driver, "text", "Usuarios", getTimeout());
    }

    static public List<WebElement> getWelcomeMessageText(WebDriver driver) {
        //Esperamos a que se cargue el saludo de bienvenida en Español
        return SeleniumUtils.waitLoadElementsBy(driver, "text", "usuarios", getTimeout());
    }
}
