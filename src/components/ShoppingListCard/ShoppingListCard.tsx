
import { useState } from 'react'
import type { FormEvent } from 'react'

import './ShoppingListCard.css'

type ShoppingListCardProps = {
  title: string
  itemCount: number
  onDelete: () => void
  onEdit: (newName: string) => void
  onOpen: () => void
  onDuplicate: () => void
}

function ShoppingListCard({
  title,
  itemCount,
  onDelete,
  onEdit,
  onOpen,
  onDuplicate
}: ShoppingListCardProps) {

  // Controla se o cartão está sendo editado
  const [isEditing, setIsEditing] = useState(false)

  // Armazena temporariamente o novo nome
  const [editedName, setEditedName] = useState(title)

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const name = editedName.trim()

    if (!name) return

    onEdit(name)
    setIsEditing(false)
  }

  function handleCancel() {
    setEditedName(title)
    setIsEditing(false)
  }


  return (
    <article className="shopping-list-card">
      {isEditing ? (
        <form
          className="shopping-list-card__form"
          onSubmit={handleSave}
        >
          <input
            type="text"
            value={editedName}
            maxLength={60}
            aria-label="Novo nome da lista"
            onChange={(event) =>
              setEditedName(event.target.value)
            }
          />

          <div className="shopping-list-card__actions">
            <button
              type="button"
              className="shopping-list-card__cancel"
              onClick={handleCancel}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="shopping-list-card__save"
            >
              Salvar
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="shopping-list-card__info">
            <h3 className="shopping-list-card__title">
              {title}
            </h3>

            <p className="shopping-list-card__count">
              {itemCount} produtos adicionados
            </p>
          </div>

          <div className="shopping-list-card__actions">
            <button
              type="button"
              className="shopping-list-card__open"
              onClick={onOpen}
              aria-label={`Abrir lista ${title}`}
            >
              Abrir lista
            </button>

            <button
              type="button"
              className="shopping-list-card__edit"
              onClick={() => {
                setEditedName(title)
                setIsEditing(true)
              }}
              aria-label={`Editar lista ${title}`}
            >
              Editar
            </button>

            <button
              type="button"
              className="shopping-list-card__delete"
              onClick={onDelete}
              aria-label={`Excluir lista ${title}`}
            >
              Excluir
            </button>

            
            {/* ========================================
                DUPLICAR LISTA
            ======================================== */}

            <button
              type="button"
              className="shopping-list-card__duplicate"
              onClick={onDuplicate}
              aria-label={`Duplicar lista ${title}`}
            >
              <span aria-hidden="true">⧉</span>
              Duplicar
            </button>
          </div>
        </>
      )}
    </article>
  )
}

export default ShoppingListCard
