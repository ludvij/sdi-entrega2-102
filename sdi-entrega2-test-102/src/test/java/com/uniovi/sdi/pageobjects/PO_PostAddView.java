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

}
