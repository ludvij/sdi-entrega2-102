package com.uniovi.sdi.pageobjects;

import org.junit.jupiter.api.Assertions;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import java.util.List;

public class PO_SignUpView extends PO_NavView {
    static public void fillForm(WebDriver driver, String emailp, String namep, String surnamep, String passwordp, String passwordconfp) {
        //Vamos al formulario de registro
        PO_HomeView.clickOption(driver, "signup", "class", "btn btn-primary");
        //Rellenamos el formulario.
        WebElement dni = driver.findElement(By.name("email"));
        dni.click();
        dni.clear();
        dni.sendKeys(emailp);
        WebElement name = driver.findElement(By.name("name"));
        name.click();
        name.clear();
        name.sendKeys(namep);
        WebElement lastname = driver.findElement(By.name("surname"));
        lastname.click();
        lastname.clear();
        lastname.sendKeys(surnamep);
        WebElement password = driver.findElement(By.name("password"));
        password.click();
        password.clear();
        password.sendKeys(passwordp);
        WebElement passwordConfirm = driver.findElement(By.name("passwordCheck"));
        passwordConfirm.click();
        passwordConfirm.clear();
        passwordConfirm.sendKeys(passwordconfp);
        //Pulsar el boton de Alta.
        By boton = By.className("btn");
        driver.findElement(boton).click();
    }

    public static void signUpAs(WebDriver driver, String email, String password, String name, String surname) {
        fillForm(driver, email, name, surname, password, password);
        String text = "Nuevo usuario registrado. Inicie la sesión.";
        List<WebElement> result = checkElementBy(driver, "text", text);
        Assertions.assertEquals(text, result.get(0).getText());
    }

    public static void signUpErrorAs(WebDriver driver, String email, String password, String name, String surname) {
        fillForm(driver, email, name, surname, password, password);
        //Comprobamos que seguimos en la página de registro.
        Assertions.assertTrue(driver.getCurrentUrl().contains("/signup"));
    }

    public static void signUpErrorAs(WebDriver driver, String email, String password, String passwordConfirm, String name, String surname) {
        fillForm(driver, email, name, surname, password, passwordConfirm);
        //Comprobamos que seguimos en la página de registro.
        String text = "Ambas contraseñas deben de ser iguales.";
        Assertions.assertTrue(driver.getCurrentUrl().contains("/signup"));
        List<WebElement> result = checkElementBy(driver, "text", text);
        Assertions.assertEquals(text, result.get(0).getText());
    }
}
