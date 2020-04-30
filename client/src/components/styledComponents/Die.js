import styled from "styled-components";

export const Die = styled.button`
width: 6.5rem;
    height: 6.5rem;
    img {
        width: 6.5rem;
    }
cursor: pointer;
background: ${(props) => (props.disabled ? "#444" : "#f8f8f8")};
color: ${(props) => (props.disabled ? "#f8f8f8" : "#444")};
margin: 10px;
padding: 0 !important;
zoom: 1; /* IE */
-moz-transform: scale(1); /* Firefox */
-moz-transform-origin: 0 0;
-o-transform: scale(1); /* Opera */
-o-transform-origin: 0 0;
-webkit-transform: scale(1); /* Safari And Chrome */
-webkit-transform-origin: 0 0;
transform: scale(1); /* Standard Property */
transform-origin: 0 0;  /* Standard Property */

    &:hover {
        zoom: 1.1; /* IE */
        -moz-transform: scale(1.1); /* Firefox */
        -moz-transform-origin: 0 0;
        -o-transform: scale(1.1); /* Opera */
        -o-transform-origin: 0 0;
        -webkit-transform: scale(1.1); /* Safari And Chrome */
        -webkit-transform-origin: 0 0;
        transform: scale(1.1); /* Standard Property */
        transform-origin: 0 0;  /* Standard Property */
    }

    &.rolling {
        animation: rolling 0.25s 1;
    }

    @keyframes rolling {
        from {
            transform-origin: 40% 55%;
            transform: rotate(0deg);
          }
          to {
            transform-origin: 55% 40%;
            transform: rotate(360deg);
    }
}

@media (max-width: 768px){
    width: 4.5rem;
    height: 4.5rem;
    img {
        width: 4.5rem;
    }
}
`;
