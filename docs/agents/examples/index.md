---
nav: All examples
description: An index of agent examples and sample code.
hide:
- toc
---

# Examples

No need to start from scratch, we've got code examples and sample agents for you to browse, copy, and learn from. There are smaller agents that demonstrate a single feature, and larger and more complete ones that show realistic use cases.

{% for section in page.parent.children|selectattr("is_section") %}

## {{section.title}}

<section class="box-row" markdown>

{% for child in section.children %}

<div class="box-item" markdown>
{# Read the child page's source, but don't output anything. This is required to populate the child page's title and metadata. #}
{{ child.read_source(config) or "" }}

### {% if child.meta.icon %}:{{child.meta.icon|replace("/", "-")}}:{% endif %} {{ child.meta.get("nav", child.title) }}

{{child.meta.description}}

[View]({{getRelativePath(child,page)}}){ .md-button }
</div>

{% endfor %}

</section>

{% endfor %}
