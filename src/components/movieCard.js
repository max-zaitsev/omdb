const movieTemplate = document.createElement('template');

movieTemplate.innerHTML = `
  <style>
  :host {
    --card-background-color: rgba(255, 255, 255, 0.24);
    --card-border-radius: 12px;
  
    --card-width: 302px;
    --card-height: 454px;
  
    --card-active-name-color: rgba(255, 255, 255, 1);
    --card-inactive-name-color: rgba(255, 255, 255, 0.24);
  
    --card-active-meta-color: rgba(255, 255, 255, 0.4);
    --card-inactive-meta-color: rgba(255, 255, 255, 0.24);
    --card-skeleton-color: rgba(255, 255, 255, 0.08);
  }
  
  @keyframes fadeIn {
    0% {
      opacity: 0;
    }
  
    100% {
      opacity: 1;
    }
  }
  
  /* --------------------------------------------------------------------------------------------------------------- */
  
  .card {
    box-sizing: border-box;
    cursor: pointer;
  }
  
  /* --------------------------------------------------------------------------------------------------------------- */
  
  .card__link {
    text-decoration: none;
  }

  .card__card-content {
    padding: 20px;
    position: relative;
    display: flex;
    width: var(--card-width);
    height: var(--card-height);
    padding: 20 px;
    border-radius: var(--card-border-radius);
    box-sizing: border-box;
    background-color: var(--card-background-color);
    overflow: hidden;
  }
  
  /* --------------------------------------------------------------------------------------------------------------- */
  
  .card__image {
    display: none;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-position: 50% 50%;
    background-repeat: no-repeat;
    background-size: cover;
    transition: var(--default-animation-duration) ease-out;
  }
  
  .card_has-image .card__image {
    display: block;
  }
  
  
  .card__image-overlay {
    display: none;
    backdrop-filter: blur(2px);
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0) 26.43%, rgba(0, 0, 0, 0.8) 72.41%);
    z-index: 1;
  }
  
  .card_has-image:hover .card__image-overlay {
    display: block;
    animation: fadeIn var(--default-animation-duration);
  }
  
  
  /* --------------------------------------------------------------------------------------------------------------- */
  
  .card__info {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    width: 100%;
  }
  
  .card_loading .card__info {
    display: none;
  }
  
  .card_has-image:hover .card__info {
    z-index: 2;
    animation: fadeIn var(--default-animation-duration);
  }
  
  /* --------------------------------------------------------------------------------------------------------------- */
  
  .card__rating {
    font-size: 24px;
    line-height: 36px;
    margin: 0px;
  }
  
  /* --------------------------------------------------------------------------------------------------------------- */
  .card__name {
    font-size: 24px;
    line-height: 36px;
    font-weight: 700;
    margin-bottom: 12px;
    margin-top: 4px;
    color: var(--card-inactive-name-color);
  }
  
  .card:hover .card__name {
    color: var(--card-active-name-color);
  }
  
  /* --------------------------------------------------------------------------------------------------------------- */
  
  .card__meta {
    color: var(--card-inactive-meta-color);
    display: flex;
    justify-content: space-between;
    font-size: 16px;
    line-height: 24px;
  }
  
  .card:hover .card__meta {
    color: var(--card-active-meta-color);
  }
  
  /* --------------------------------------------------------------------------------------------------------------- */
  
  .card__skeleton {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: none;
    flex-direction: column;
    justify-content: flex-end;
    padding: 20px 36px 68px 20px;
  }
  
  .card_loading .card__skeleton {
    display: flex;
  }
  
  /* --------------------------------------------------------------------------------------------------------------- */
  
  .card__line {
    height: 24px;
    background-color: var(--card-skeleton-color);
    border-radius: 2px;
  }
  
  .card__line+.card__line {
    margin-top: 8px;
  }
  
  .card__line_short {
    width: 63.5%;
  }
  
  /* --------------------------------------------------------------------------------------------------------------- */
  </style>
  <article class="card">
    <a href="" class="card__link">
      <div class="card__card-content">
        <div class="card__image-overlay"></div>
        <div class="card__image"></div>
        <div class="card__info">
          <h3 class="card__name"></h3>
          <div class="card__meta">
            <div class="card__genre"></div>
            <div class="card__year"></div>
          </div>
        </div>
        <div class="card__skeleton">
          <div class="card__line"></div>
          <div class="card__line card__line_short"></div>
        </div>
      </div>
    </a>
  </article>
`;

const params = ['title', 'poster', 'link', 'year', 'genre', 'rating'];
const mirror = (params, element) => {
  params.forEach(param => {
    Object.defineProperty(element, param, {
      get() {
        return this.getAttribute(param);
      },
      set(value) {
        this.setAttribute(param, value);
      }
    });
  });
};

class MovieCard extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: 'open' });
    const template = movieTemplate.content.cloneNode(true);

    shadow.appendChild(template);
    mirror(params, this);
  }

  static get observedAttributes() {
    return params;
  }

  attributeChangedCallback(param, oldValue, newValue) {
    switch (param) {
      case 'title':
        this.shadowRoot.querySelector('.card__name').textContent = newValue;
        break;

      case 'poster':
        if (newValue === 'N/A') {
          this.shadowRoot
            .querySelector('.card')
            .classList.remove('.card_has-image');
        } else {
          this.shadowRoot
            .querySelector('.card')
            .classList.add('card_has-image');
        }
        this.shadowRoot.querySelector('.card__image').style.backgroundImage = `url(${newValue})`;
        break;

      case 'link':
        return (this.shadowRoot.querySelector('.card__link').href = newValue);

      case 'year':
        return (this.shadowRoot.querySelector(
          '.card__year'
        ).textContent = newValue);

      case 'rating':
        return (this.shadowRoot.querySelector(
          '.card__rating'
        ).textContent = newValue);

      case 'genre':
        return (this.shadowRoot.querySelector(
          '.card__genre'
        ).textContent = newValue);
    }
  }
}

customElements.define('movie-card', MovieCard);
