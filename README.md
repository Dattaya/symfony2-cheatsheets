# Symfony2 cheatsheets
## Contribution notes
Contributing is fairly easy, all you need to know is some basic html tags. Every page starts with `h1` tag -
header of the page, all present `h2` tags automatically included into sub navigation bar. Example of a page:

```html
<h1>Sensio Framework Extra Bundle</h1>

<h2>@Route</h2>

<table>
    <thead>
    <tr>
        <th>Option</th>
        <th>Type</th>
        <th>Class level</th>
        <th>Action level</th>
        <th>Description</th>
        <th>Example</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <td>requirements</td>
        <td>array</td>
        <td>✓</td>
        <td>✓</td>
        <td>Regular expression requirements for route parameters.</td>
        <td>
<script type="php">
/**
 * @Route("/{id}", requirements={"id" = "\d+"}, defaults={"foo" = "bar"})
 */
public function showAction($id)
{
}
</script>
        </td>
    </tr>
    </tbody>
</table>
```

If you created a new page, add a link pointing to it in the `menu.html` file, e.g.
`<li><a href="#components/form.html">Form</a></li>` (each section has its own `menu.html` file).

### Popup
To create a popup use a `data-content` attribute:

```html
<a href="http://symfony.com/doc/current/reference/forms/types/password.html#always-empty"
   data-content="<strong>type</strong>: <code>bool</code> <strong>default</strong>: <code>true</code>.
   If set to <code>true</code>, the field will always render blank, even if the corresponding field has a value.">
    always_empty</a>
```
Code above represented as:
![Inline example](http://dattaya.github.com/symfony2-cheatsheets/resources/images/readme/popup.png)

### Example
All code samples should be for the latest stable Symfony version (2.1 considered as stable since it will be released
soon).

#### Inline example
Inline examples should be wrapped in `code` tags: `<code>{% if is_granted('ROLE_ADMIN') %} ...</code>`. 'less-than' sign
have to be replaced by the HTML escape entity `&lt;`:
`<code>&lt;a href="{{ url('_welcome') }}">Home&lt;/a></code>`.

It's displayed as:
![Inline example](http://dattaya.github.com/symfony2-cheatsheets/resources/images/readme/inline_example.png)

#### Example in a modal
Should be surrounded by `script` tags (see the example above) with the proper `type` attribute. Supported types: `php`,
`twig`, `yaml`, `javascript`. You do not need to escape 'less-than' sign. Column title must be: `Example`.

It's displayed as:
![Inline example](http://dattaya.github.com/symfony2-cheatsheets/resources/images/readme/modal_example.png)

### Deprecated
Use the `deprecated` class to mark something as deprecated. Could be applied to a part of text or a whole table row:

`<span class="deprecated">option</span> ...`

`<tr class="deprecated"> ...`

### Required
To mark something as required use the `required` class:

`<td class="required">default</td>`
![Inline example](http://dattaya.github.com/symfony2-cheatsheets/resources/images/readme/required.png)
