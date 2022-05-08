package com.uniovi.sdi.pageobjects;

import com.uniovi.sdi.util.SeleniumUtils;
import org.junit.jupiter.api.Assertions;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import java.util.List;

public class PO_View {
	
	protected static int timeout = 2;

	public static int getTimeout() {
		return timeout;
	}

	public static void setTimeout(int timeout) {
		PO_View.timeout = timeout;
	}


	/**
	 *  Espera por la visibilidad de un elemento/s en la vista actualmente cargandose en driver..
	 * 
	 * @param driver: apuntando al navegador abierto actualmente.
	 * @param criterio: "id" or "class" or "text" or "@attribute" or "free". Si el valor de criterio es free es una expresion xpath completa.
	 * @param text: contiene el texto a buscar.
	 * @return Se retornará la lista de elementos resultantes de la búsqueda.
	 */
	static public List<WebElement> checkElementBy(WebDriver driver, String criterio, String text) {
		return  SeleniumUtils.waitLoadElementsBy(driver, criterio, text, getTimeout());
	}

	static public void checkError(WebDriver driver) {
		String checkText = "No puedes ver las publicaciones de esa persona";
		List<WebElement> result = PO_View.checkElementBy(driver, "text", checkText);
		Assertions.assertFalse(result.isEmpty());
	}
}
