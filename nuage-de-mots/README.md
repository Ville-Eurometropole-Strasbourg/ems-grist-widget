# Présentation du widget

Pouvoir faire un nuage de mots collaboratif lors d’ateliers (type Wooclap ou Kahoot).

<img width="1664" height="789" alt="image(1)" src="https://github.com/user-attachments/assets/4a9e05d3-7ace-414d-a351-e78014903e06" />

Le widget prend en entrée une colonne de mots et éventuellement une fréquence associée.

Il y a plusieurs réglages possibles pour personnaliser le nuage de mots.

Un bouton est disponible pour afficher uniquement le nuage de mots en plein écran.

# Utilisation du widget

1. Créer une table avec la question à poser aux participants
2. Créer le formulaire qui recevra les réponses des participants

<img width="655" height="312" alt="image" src="https://github.com/user-attachments/assets/7b3c83c9-2548-441e-9e77-ae1c2760c2e7" />

3. Ajouter une vue avec l’URL personnalisée du widget nuage de mots qui a pour donnée source la table créée précédemment groupée par la colonne de la question.
4. Sélectionner les correspondances de colonnes :
   
    a. Mot : `votre question`
   
    b. Fréquence : `count`

Et voilà ! Lorsqu’une personne remplit le formulaire, le mot se rajoute automatiquement au nuage de mots avec la taille qui s’adapte selon le nombre de réponses.

# Bonus : mode présentation

Si vous souhaitez afficher uniquement le nuage de mots en présentation, vous pouvez créer une page dédiée avec uniquement le widget et ajouter à la fin de l’URL de cette page `?embed=true`
