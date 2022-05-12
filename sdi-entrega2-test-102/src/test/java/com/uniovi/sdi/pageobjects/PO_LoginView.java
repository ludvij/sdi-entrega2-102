package com.uniovi.sdi.pageobjects;

import com.uniovi.sdi.util.SeleniumUtils;
import org.junit.jupiter.api.Assertions;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import java.util.List;

public class PO_LoginView extends PO_NavView {

	static public void fillForm(WebDriver driver, String emailp, String passwordp) {
		//Vamos al formulario de registro
		clickOption(driver, "login", "class", "btn btn-primary");
		WebElement dni = driver.findElement(By.name("email"));
		dni.click();
		dni.clear();
		dni.sendKeys(emailp);
		WebElement password = driver.findElement(By.name("password"));
		password.click();
		password.clear();
		password.sendKeys(passwordp);
		//Pulsar el boton de Alta.
		By boton = By.className("btn");
		driver.findElement(boton).click();	
	}

	public static void loginAsAdmin(WebDriver driver) {

		//Rellenamos el formulario.
		fillForm(driver, "admin@email.com", "admin");
		String text = "Los usuarios que actualmente figuran en el sistema son los siguientes:";
		List<WebElement> result = checkElementBy(driver, "text", text);
		Assertions.assertEquals(text, result.get(0).getText());
	}

	public static void loginAs(WebDriver driver, String emailp, String passwordp) {
		//Rellenamos el formulario.
		fillForm(driver, emailp, passwordp);
		String text = "Lista de usuarios:";
		List<WebElement> result = checkElementBy(driver, "text", text);
		Assertions.assertEquals(text, result.get(0).getText());
	}

	public static void loginErrorAs(WebDriver driver, String emailp, String passwordp) {
		//Rellenamos el formulario.
		fillForm(driver, emailp, passwordp);
		String text = "Identificación de usuario";
		List<WebElement> result = checkElementBy(driver, "text", text);
		Assertions.assertEquals(text, result.get(0).getText());

	}

	public static void loginAsApi(WebDriver driver, String emailp, String passwordp) {
		SeleniumUtils.waitLoadElementsBy(driver, "text", "Email:", PO_View.getTimeout());
		//Rellenamos el formulario.
		fillFormApi(driver, emailp, passwordp);
		String text = "Nombre";
		List<WebElement> result = checkElementBy(driver, "text", text);
		Assertions.assertEquals(text, result.get(0).getText());
	}

	static public void fillFormApi(WebDriver driver, String emailp, String passwordp) {
		WebElement dni = driver.findElement(By.name("email"));
		dni.click();
		dni.clear();
		dni.sendKeys(emailp);
		WebElement password = driver.findElement(By.name("password"));
		password.click();
		password.clear();
		password.sendKeys(passwordp);
		//Pulsar el boton de Alta.
		By boton = By.className("btn");
		driver.findElement(boton).click();
	}

	public static void loginErrorAsApi(WebDriver driver, String emailp, String passwordp) {
		//Rellenamos el formulario.
		fillFormApi(driver, emailp, passwordp);
		String text = "Usuario no encontrado";
		List<WebElement> result = checkElementBy(driver, "text", text);
		Assertions.assertEquals(text, result.get(0).getText());

	}

}
