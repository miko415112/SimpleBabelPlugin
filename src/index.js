import $ from "jquery";
import { transformCode } from "./transform.js";

$(document).ready(function () {
  $("#transform-button").on("click", function () {
    const inputCode = $("#input-code").val();
    const selectedFeature = $('input[name="features"]:checked').val();

    console.log(selectedFeature);
    try {
      let outputCode = transformCode(inputCode, {
        [selectedFeature]: true,
      });
      $("#output-code").val(outputCode);
    } catch (error) {
      $("#output-code").val("Error: " + error.message);
    }
  });
});
