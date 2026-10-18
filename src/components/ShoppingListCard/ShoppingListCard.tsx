import {
  ArrowUpRight,
  Pencil,
  Copy,
  Trash2
} from 'lucide-react'
import Button from '../ui/Button/Button'
import { useId, useState } from 'react'
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
  const editInputId = useId()
  const [isEditing, setIsEditing] = useState(false)
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

  function handleStartEdit() {
    setEditedName(title)
    setIsEditing(true)
  }

  return (
    <article className="shopping-list-card">
      {isEditing ? (
        <form
          className="shopping-list-card__form"
          onSubmit={handleSave}
        >
          <label htmlFor={editInputId}>
            Nome da lista
          </label>

          <input
            id={editInputId}
            type="text"
            value={editedName}
            maxLength={60}
            autoFocus
            onChange={(event) =>
              setEditedName(event.target.value)
            }
          />

          <div className="shopping-list-card__form-actions">
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
              {itemCount}{' '}
              {itemCount === 1
                ? 'produto adicionado'
                : 'produtos adicionados'}
            </p>
          </div>

          <div className="shopping-list-card__actions">
            <Button
              variant="primary"
              icon={<ArrowUpRight />}
              fullWidth
              onClick={onOpen}
              aria-label={`Abrir lista ${title}`}
            >
              Abrir lista
            </Button>

            <div className="shopping-list-card__secondary-actions">
              <Button
                variant="secondary"
                icon={<Pencil />}
                onClick={handleStartEdit}
                aria-label={`Editar lista ${title}`}
              >
                Editar
              </Button>

              <Button
                variant="secondary"
                icon={<Copy />}
                onClick={onDuplicate}
                aria-label={`Duplicar lista ${title}`}
              >
                Duplicar
              </Button>

              <Button
                variant="danger"
                icon={<Trash2 />}
                onClick={onDelete}
                aria-label={`Excluir lista ${title}`}
              >
                Excluir
              </Button>
            </div>
          </div>
        </>
      )}
    </article>
  )
}

export default ShoppingListCard
