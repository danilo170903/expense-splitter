import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { addExpense, addMember, ApiError, getGroup, UnauthorizedError } from '../api.js'
import Card from '../components/Card.jsx'
import { useAuth } from '../auth.js'
import { formatCents, formatTransfer } from '../format.js'

export default function Group() {
  const { id } = useParams()
  const { setUser } = useAuth()
  const [group, setGroup] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [memberName, setMemberName] = useState('')
  const [memberError, setMemberError] = useState('')
  const [expenseTitle, setExpenseTitle] = useState('')
  const [expenseAmount, setExpenseAmount] = useState('')
  const [expensePayer, setExpensePayer] = useState('')
  const [expenseError, setExpenseError] = useState('')

  useEffect(() => {
    let ignore = false
    setGroup(null)
    setLoadError('')
    getGroup(id)
      .then((data) => {
        if (!ignore) setGroup(data)
      })
      .catch((err) => {
        if (ignore) return
        if (err instanceof UnauthorizedError) setUser(null)
        else if (err instanceof ApiError && err.status === 404) setLoadError('Grupa nije pronađena')
        else setLoadError(err.message)
      })
    return () => {
      ignore = true
    }
  }, [id, setUser])

  if (loadError) {
    return (
      <>
        <Link className="back-link" to="/">← Sve grupe</Link>
        <p className="error" role="alert">{loadError}</p>
      </>
    )
  }

  if (!group) return <p className="muted">Učitavanje…</p>

  const members = group.members
  const hasMembers = members.length > 0
  const payer = members.includes(expensePayer) ? expensePayer : ''

  function handleFormError(err, setFormError) {
    if (err instanceof UnauthorizedError) setUser(null)
    else setFormError(err.message)
  }

  async function handleAddMember(event) {
    event.preventDefault()
    setMemberError('')
    try {
      setGroup(await addMember(id, memberName.trim()))
      setMemberName('')
    } catch (err) {
      handleFormError(err, setMemberError)
    }
  }

  async function handleAddExpense(event) {
    event.preventDefault()
    setExpenseError('')
    try {
      setGroup(await addExpense(id, { title: expenseTitle.trim(), amount: expenseAmount.trim(), payer }))
      setExpenseTitle('')
      setExpenseAmount('')
    } catch (err) {
      handleFormError(err, setExpenseError)
    }
  }

  return (
    <>
      <header className="group-head">
        <Link className="back-link" to="/">← Sve grupe</Link>
        <h1 className="page-title">{group.name}</h1>
      </header>

      <Card title="Učesnici">
        {hasMembers ? (
          <ul className="rows">
            {members.map((member) => (
              <li key={member} className="row">{member}</li>
            ))}
          </ul>
        ) : (
          <p className="muted">Još nema učesnika. Dodajte prvog ispod.</p>
        )}
        <form className="form" onSubmit={handleAddMember}>
          <label className="field">
            <span>Ime učesnika</span>
            <input
              className="input"
              maxLength={40}
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
              required
            />
          </label>
          {memberError && <p className="error" role="alert">{memberError}</p>}
          <button type="submit" className="btn btn-primary btn-submit">
            Dodaj
          </button>
        </form>
      </Card>

      <Card title="Novi trošak">
        {!hasMembers && (
          <p className="hint">Dodajte učesnike da biste unijeli trošak.</p>
        )}
        <form className="form" onSubmit={handleAddExpense}>
          <fieldset className="form-fieldset" disabled={!hasMembers}>
            <label className="field">
              <span>Naziv</span>
              <input
                className="input"
                maxLength={60}
                value={expenseTitle}
                onChange={(e) => setExpenseTitle(e.target.value)}
                required
              />
            </label>
            <label className="field">
              <span>Iznos (€)</span>
              <input
                className="input"
                inputMode="decimal"
                placeholder="0,00"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                required
              />
            </label>
            <label className="field">
              <span>Platio/la</span>
              <select
                className="input"
                value={payer}
                onChange={(e) => setExpensePayer(e.target.value)}
                required
              >
                <option value="" disabled>
                  Odaberite učesnika
                </option>
                {members.map((member) => (
                  <option key={member} value={member}>
                    {member}
                  </option>
                ))}
              </select>
            </label>
            {expenseError && <p className="error" role="alert">{expenseError}</p>}
            <button type="submit" className="btn btn-primary btn-submit">
              Dodaj trošak
            </button>
          </fieldset>
        </form>
      </Card>

      <Card title="Troškovi">
        {group.expenses.length === 0 ? (
          <p className="muted">Još nema troškova. Unesite prvi iznad.</p>
        ) : (
          <ul className="rows">
            {group.expenses.map((expense) => (
              <li key={expense.id} className="row">
                <span className="row-title">{expense.title}</span>
                <span className="row-meta">
                  {expense.payer} · <span className="amount">{formatCents(expense.amountCents)}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Dugovanja">
        {group.settlement.transfers.length === 0 ? (
          <p className="muted">Svi su kvit.</p>
        ) : (
          <ul className="rows">
            {group.settlement.transfers.map((transfer, index) => {
              const row = formatTransfer(transfer)
              return (
                <li key={index} className="row">
                  <span className="row-title">{row.title}</span>
                  <span className="amount">{row.amount}</span>
                </li>
              )
            })}
          </ul>
        )}
      </Card>
    </>
  )
}
