package com.uniovi.sdi.pageobjects;

import org.junit.jupiter.api.Assertions;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import java.util.List;

public class PO_PostAddView extends PO_NavView {
    static public void fillForm(WebDriver driver, String title, String body) {
        //Rellenamos el formulario.
        WebElement elemTitle = driver.findElement(By.name("title"));
        elemTitle.click();
        elemTitle.clear();
        elemTitle.sendKeys(title);
        WebElement elemBody = driver.findElement(By.name("body"));
        elemBody.click();
        elemBody.clear();
        elemBody.sendKeys(body);
        By boton = By.className("btn");
        driver.findElement(boton).click();
    }

    public static void addPost(WebDriver driver, String title, String body) {
        fillForm(driver, title, body);
        String text = "Mis Posts";
        List<WebElement> result = checkElementBy(driver, "text", text);
        Assertions.assertEquals(text, result.get(0).getText());
    }

    public static void addPostEmpty(WebDriver driver, String title, String body) {
        fillForm(driver, title, body);
        //Comprobamos que seguimos en la página de registro.
        //String text = "Ambas contraseñas deben de ser iguales.";

        Assertions.assertTrue(driver.getCurrentUrl().contains("/posts/add"));

        //no deja mandarlo, los campos son required
        //List<WebElement> result = checkElementBy(driver, "text", text);
        //Assertions.assertEquals(text, result.get(0).getText());
    }

}
